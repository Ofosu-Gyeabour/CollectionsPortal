using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

using System.IO;
using Pickups.mtier.repos;

using System.Diagnostics;
using Pickups.mtier.businessObjects;
using System.Globalization;

namespace Pickups.Controllers
{
    public class HomeController : Controller
    {
        
        public ActionResult Index()
        {
            return View();
        }

        public ActionResult PickupPost() {
            return View();
        }

        public ActionResult Mapper() { return View(); }

        public ActionResult BranchVerification() { return View(); }

        public ActionResult Dashy() {
            return View();
        }

        [HttpGet]
        public JsonResult generateOrderNumber(string TTYPE)
        {
            //method generates order number based on the branch making the request
            var retString = string.Empty;
            var dte = string.Format("{0}{1}{2}", DateTime.Now.Year.ToString(), DateTime.Now.Month.ToString(), DateTime.Now.Day.ToString());
            var str = string.Empty;
            var mnemonic = @"RETAIL";

            try
            {
                
                var ord = string.Format("{0}/{1}/{2}", TTYPE, mnemonic, dte);
                var nextOrder = 0;

                if (TTYPE == "ROUTES")
                {
                    nextOrder = new Pickups.mtier.repos.Process{ }.getOrderRecordCount(ord);
                }

                if (TTYPE == "PICKUPS")
                {
                    nextOrder = new Pickups.mtier.repos.Process { }.getOrderRecordCount(ord);
                }

                if (TTYPE == "SPECIEMOV") {
                    nextOrder = new Pickups.mtier.repos.Process { }.getOrderRecordCount(ord);
                }

                if (TTYPE == "TELLR") {
                    nextOrder = new Pickups.mtier.repos.Process { }.getOrderRecordCount(ord);
                }

                if (TTYPE == "DHL")
                {
                    nextOrder = new Pickups.mtier.repos.Process { }.getOrderRecordCount(ord);
                }

                if (TTYPE == "IAS")
                {
                    nextOrder = new Pickups.mtier.repos.Process { }.getOrderRecordCount(ord);
                }

                switch (nextOrder.ToString().Length)
                {
                    case 1:
                        str = string.Format("{0}{1}", @"00", nextOrder.ToString());
                        break;
                    case 2:
                        str = string.Format("{0}{1}", @"0", nextOrder.ToString());
                        break;
                    case 3:
                        str = nextOrder.ToString();
                        break;
                }
                
                return Json(new { status = true, msg = string.Format("{0}/{1}", ord, str) }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                return Json(new { status = false, msg = retString }, JsonRequestBehavior.AllowGet);
            }
        }

        [HttpGet]
        public JsonResult getProcessList(string PTYP) {
            try
            {
                var obj = new Pickups.mtier.repos.Process { processType = PTYP };
                return Json(new { status = true, msg = obj.get() }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e) {
                return Json(new { status = false, msg = e.Message },JsonRequestBehavior.AllowGet);
            }
        }

        [HttpGet]
        public JsonResult getSpecieLogRecords(string SLogFile) { 
            //method gets the specie logs for a specific upload
            try
            {
                var sp = new SpecieMovement { };
                var spLogs = sp.get(SLogFile);

                return Json(new { status = true, msg = spLogs },JsonRequestBehavior.AllowGet);
            }
            catch (Exception e) {
                return Json(new { status = false, msg = e.Message },JsonRequestBehavior.AllowGet);
            }
        }

        [HttpGet]
        public JsonResult getPickupLogRecords(string PLogFile) {
            try
            {
                var bp = new BuillionData { };
                return Json(new { status = true, msg = bp.get(PLogFile) },JsonRequestBehavior.AllowGet);
            }
            catch (Exception e) {
                return Json(new { status = false, msg = e.Message },JsonRequestBehavior.AllowGet);
            }
        }

        [HttpGet]
        public JsonResult getPickupUsingDate(string df, string dt) {
            try
            {
                //String format = "dd/MM/yyyy";
                //DateTime _dateF = DateTime.ParseExact(df, format, CultureInfo.InvariantCulture, DateTimeStyles.None);
                //DateTime _dateT = DateTime.ParseExact(dt, format, CultureInfo.InvariantCulture, DateTimeStyles.None);

                var obj = new BuillionData { };
                var rs = obj.getBranchPickupsUsingDateRange(df, dt);

                if (Session["profile"].ToString() == "ADM")
                {
                    return Json(new { status = true, msg = rs }, JsonRequestBehavior.AllowGet);
                }
                else
                {
                    var refinedList = new List<BuillionData>();
                    var BID = int.Parse(Session["department"].ToString());

                    foreach (var ps in rs)
                    {
                        if (ps.objCompany.Id == BID)
                        {
                            refinedList.Add(ps);
                        }
                    }

                    return Json(new { status = true, msg = refinedList }, JsonRequestBehavior.AllowGet);
                }

                
            }
            catch (Exception e) {
                return Json(new { status = false, msg = e.Message },JsonRequestBehavior.AllowGet);
            }
        }

        [HttpGet]
        public JsonResult getCorrectDHLUsingFileName(string FNAME) {
            try
            {
                var d = new DHLData
                {
                    objProcess = new mtier.repos.Process { processName = FNAME }
                };

                var dList = d.get();

                if (Session["profile"].ToString() == "ADM")
                {
                    return Json(new { status = true, msg = dList }, JsonRequestBehavior.AllowGet);
                }
                else 
                {
                    var refinedList = new List<DHLData>();
                    var BID = int.Parse(Session["department"].ToString());

                    foreach (var ds in dList) {
                        if (ds.objCompany.Id == BID) {
                            refinedList.Add(ds);
                        }
                    }

                    return Json(new { status = true, msg = refinedList },JsonRequestBehavior.AllowGet);
                }
            }
            catch {
                return Json(new { status = false },JsonRequestBehavior.AllowGet);
            }
        }

        [HttpGet]
        public JsonResult getPickupsUsingFileName(string FNAME) { 
            //method is used to get pickup records using the name of the file they were loaded from
            try
            {
                var p = new BuillionData { };
                var pList = p.getBranchPickupsUsingFileName(FNAME);

                if (Session["profile"].ToString() == "ADM")
                {
                    return Json(new { status = true, msg = pList }, JsonRequestBehavior.AllowGet);
                }
                else {
                    var refinedList = new List<BuillionData>();
                    var BID = int.Parse(Session["department"].ToString());

                    foreach (var ps in pList) {
                        if (ps.objCompany.Id == BID) {
                            refinedList.Add(ps);
                        }
                    }

                    return Json(new { status = true, msg = refinedList },JsonRequestBehavior.AllowGet);
                }
                
            }
            catch (Exception e) {
                Debug.Print(e.Message);
                return Json(new { status = false, msg = e.Message },JsonRequestBehavior.AllowGet);
            }
        }

        [HttpGet]
        public JsonResult getPickupsUsingBranchCode(string BCODE) { 
            //method is to loop through resultant and return list of pickups for that particular branch
            try
            {
                var result = new List<BuillionData>();

                var dta = BuillionData.resultant;
                if (dta != null)
                {
                    foreach (var d in dta) {
                        if (d.objCompany.branchCode == BCODE) {
                            result.Add(d);
                        }
                    }

                    return Json(new { status = true, msg = result },JsonRequestBehavior.AllowGet);
                }
                else { return Json(new { status = false, msg = "No data was selected" },JsonRequestBehavior.AllowGet); }
            }
            catch (Exception e) {
                return Json(new { status = false, msg = e.Message },JsonRequestBehavior.AllowGet);
            }
        }

        [HttpGet]
        public JsonResult getSpecieMovementUsingFileName(string FNAME) {
            try
            {
                var sp = new SpecieMovement { };
                var spList = sp.getBranchSpeciesUsingFileName(FNAME);

                if (Session["profile"].ToString() == "ADM")
                {
                    return Json(new { status = true, msg = spList }, JsonRequestBehavior.AllowGet);
                }
                else {
                    var refinedList = new List<SpecieMovement>();

                    var BID = int.Parse(Session["department"].ToString());
                    foreach (var s in spList) {
                        if (s.objCompany.Id == BID) {
                            refinedList.Add(s);
                        }
                    }

                    return Json(new { status = true, msg = refinedList },JsonRequestBehavior.AllowGet);
                }
            }
            catch (Exception e) {
                return Json(new { status = false, msg = e.Message },JsonRequestBehavior.AllowGet);
            }
        }

        [HttpPost]
        public JsonResult analyzeSpecieMilageData() { 
            //this method is used to analyze the milage data of the specie movement
            try
            {
                var badDta = new List<SpecieMovement>();
                var goodDta = new List<SpecieMovement>();

                if (SpecieMovement.specieListData != null)
                {
                    foreach (var o in SpecieMovement.specieListData) {
                        if (o.objRoute.Km <= o.objSpecie.Milage)
                        {
                            goodDta.Add(o);
                        }
                        else {
                            badDta.Add(o);
                        }
                    }

                    return Json(new { status = true, msg = goodDta, extraDta = badDta },JsonRequestBehavior.AllowGet);
                }
                else { return Json(new { status = true, msg = "no data" },JsonRequestBehavior.AllowGet); }
            }
            catch (Exception e) {
                return Json(new { status = false, msg = e.Message },JsonRequestBehavior.AllowGet);
            }
        }

        [HttpGet]
        public JsonResult getVehicleRoutesRecords(string RLogFile) {
            try
            {
                var o = new VehicleRoutes { };
                var olist = o.get(RLogFile);

                return Json(new { status = true, msg = olist },JsonRequestBehavior.AllowGet);
            }
            catch (Exception e) {
                return Json(new { status = false, msg = e.Message },JsonRequestBehavior.AllowGet);
            }
        }

        [HttpGet]
        public JsonResult getVehicleRoutesForBranch(int BID) {
            try
            {
                var o = new VehicleRoutes { objCompany = new Company { Id = BID } };
                return Json(new { status = true, msg = o.getBranchRoutes() },JsonRequestBehavior.AllowGet);
            }
            catch (Exception e) {
                return Json(new { status = false, msg = e.Message },JsonRequestBehavior.AllowGet);
            }
        }

        [HttpGet]
        public JsonResult getCompanyList() {
            try
            {
                var c = new Company { };
                var cList = c.get();

                return Json(new { status = true, msg = cList },JsonRequestBehavior.AllowGet);
            }
            catch (Exception e) {
                return Json(new { status = false, msg = e.Message },JsonRequestBehavior.AllowGet);
            }
        }

        [HttpGet]
        public JsonResult saveStaffInformation(string[] items) {
            try
            {
                //items holds an array of the details of the staff
                var obj = new BranchOperative
                {
                    staffNumber = items[1].ToString(),
                    surname = items[2].ToString(),
                    otherNames = items[3].ToString(),
                    capacity = items[4].ToString(),
                    emailAddress = items[5].ToString(),
                    mobile = items[6].ToString(),
                    objCompany = new Company { Id = int.Parse(items[0].ToString()) }
                };

                obj.add();
                return Json(new { status = true, msg = "staff data saved successfully!!!" },JsonRequestBehavior.AllowGet);
            }
            catch (Exception e) {
                return Json(new { status = false, msg = e.Message },JsonRequestBehavior.AllowGet);
            }
        }

        [HttpGet]
        public JsonResult saveUserInformation(string[] usrData) { 
            //saves user data into the data store
            try
            {
                var o = new Usr { };
                o.username = usrData[0].ToString();
                
                if (usrData[1].ToString() == "YES") { o.isActive = 1; } else { o.isActive = 0; }
                if (usrData[2].ToString() == "YES") { o.usingAD = 1; } else { o.usingAD = 0; }
                if (usrData[3].ToString() == "YES") { o.isAdmin = 1; } else { o.isAdmin = 0; }

                o.profile = usrData[4].ToString();
                o.password = Hashing.CreateHash(usrData[5].ToString());
                o.objCompany = new Company { Id = int.Parse(usrData[6].ToString()) };
                o.objOfficial = new BranchOperative { staffNumber = usrData[7].ToString() };

                var bln = o.Add();
                return Json(new { status = bln, msg = string.Format("User credentials for {0} saved successfully",o.username) },JsonRequestBehavior.AllowGet);
            }
            catch (Exception e) {
                return Json(new { status = false, msg = e.Message },JsonRequestBehavior.AllowGet);
            }
        }

        [HttpGet]
        public JsonResult getStaffList() {
            try
            {
                var b = new BranchOperative { };
                return Json(new { status = true, msg = b.get() },JsonRequestBehavior.AllowGet);
            }
            catch (Exception e) {
                return Json(new { status = false, msg = e.Message },JsonRequestBehavior.AllowGet);
            }
        }

        [HttpGet]
        public JsonResult getUserList() {
            try
            {
                var u = new Usr { };
                return Json(new { status = true, msg = u.get() },JsonRequestBehavior.AllowGet);
            }
            catch (Exception e) {
                return Json(new { status = false, msg = e.Message },JsonRequestBehavior.AllowGet);
            }
        }

        [HttpGet]
        public JsonResult getTellersUsingFileName(string Fn) {
            try
            {
                var tList = new Teller { }.get(Fn);

                return Json(new { status = true, msg = tList },JsonRequestBehavior.AllowGet);
                
            }
            catch (Exception e) {
                Debug.Print(e.Message);
                return Json(new { status = false, msg = e.Message },JsonRequestBehavior.AllowGet);
            }
        }

        [HttpGet]
        public JsonResult getDHLUsingFileName(string Fn) {
            try
            {
                var DHLList = new DHL
                {
                    objProcess = new mtier.repos.Process { processName = Fn }
                }.get();

                //filter data
                if (Session["profile"].ToString() == "ADM")
                {
                    return Json(new { status = true, msg = DHLList }, JsonRequestBehavior.AllowGet);
                }
                else
                {
                    var refinedList = new List<DHL>();
                    var BID = int.Parse(Session["department"].ToString());

                    foreach (var ps in DHLList)
                    {
                        if (ps.objCompany.Id == BID)
                        {
                            refinedList.Add(ps);
                        }
                    }
                    return Json(new { status = true, msg = refinedList }, JsonRequestBehavior.AllowGet);
                }
            }
            catch (Exception e) {
                return Json(new { status = false, msg = e.Message },JsonRequestBehavior.AllowGet);
            }
        }

        [HttpGet]
        public JsonResult getDHLDataUsingFileName(string Fn) {
            try
            {
                var ddList = new DHLData
                {
                    objProcess = new mtier.repos.Process { processName = Fn }
                }.get();

                //filter data
                if (Session["profile"].ToString() == "ADM")
                {
                    return Json(new { status = true, msg = ddList }, JsonRequestBehavior.AllowGet);
                }
                else
                {
                    var refinedList = new List<DHLData>();
                    var BID = int.Parse(Session["department"].ToString());

                    foreach (var ps in ddList)
                    {
                        if (ps.objCompany.Id == BID)
                        {
                            refinedList.Add(ps);
                        }
                    }

                    return Json(new { status = true, msg = refinedList }, JsonRequestBehavior.AllowGet);
                }
            }
            catch {
                return Json(new { status = false, msg = "Error" },JsonRequestBehavior.AllowGet);
            }
        }

        [HttpGet]
        public JsonResult getFileNames(int fileFlag, string PROC) {
            try
            {
                var p = new Pickups.mtier.repos.Process { };
                var pList = p.getProcessNames(fileFlag,PROC);

                return Json(new { status = true, msg = pList },JsonRequestBehavior.AllowGet);
            }
            catch (Exception e) {
                return Json(new { status = false, msg = e.Message },JsonRequestBehavior.AllowGet);
            }
        }

        [HttpGet]
        public JsonResult getDistinctTellerFileNames() {
            try
            {
                var t = new Teller { }.getDistinctTellerFiles();

                return Json(new { status = true, msg = t },JsonRequestBehavior.AllowGet);
            }
            catch (Exception e) {
                return Json(new { status = false, msg = e.Message },JsonRequestBehavior.AllowGet);
            }
        }

        [HttpGet]
        public JsonResult getDistinctIASFileNames() {
            try
            {
                var IASList = new DHL { }.getDistinctIASFiles();
                return Json(new { status = true, msg = IASList },JsonRequestBehavior.AllowGet);
            }
            catch 
            {
                return Json(new { status = false },JsonRequestBehavior.AllowGet);
            }
        }

        [HttpGet]
        public JsonResult getDistinctTellerFilesUsingStatus(int LOAD, int STAT) {
            try
            {
                var t = new Teller { }.getDistinctTellerFiles(LOAD, STAT);
                return Json(new { status = true, msg = t },JsonRequestBehavior.AllowGet);
            }
            catch (Exception e) {
                return Json(new { status = false, msg = e.Message },JsonRequestBehavior.AllowGet);
            }
        }

        [HttpGet]
        public JsonResult getUnauthorizedIASFedexData(int LOAD, int STAT) { 
            //data is fetched using the status of the file
            try
            {
                var distinctIASRecords = new DHL { }.getDistinctIASRecordsUsingFileStatus(LOAD, STAT);
                return Json(new { status = true, msg = distinctIASRecords },JsonRequestBehavior.AllowGet);
            }
            catch { return Json(new { status = false },JsonRequestBehavior.AllowGet); }
        }

        [HttpGet]
        public JsonResult getTellerDetails(string CAPTION) { 
            //get the teller details of the file number selected
            try
            {
                var tList = new Teller { }.get(CAPTION);
                if (Session["profile"].ToString() == "ADM")
                {
                    return Json(new { status = true, msg = tList }, JsonRequestBehavior.AllowGet);
                }
                else 
                {
                    var tRefined = new List<Teller>();
                    foreach (var tt in tList) {
                        if (tt.objCompany.Id == int.Parse(Session["department"].ToString())) {
                            tRefined.Add(tt);
                        }
                    }

                    return Json(new { status = true, msg = tRefined },JsonRequestBehavior.AllowGet);
                }
            }
            catch (Exception e) {
                return Json(new { status = false, msg = e.Message },JsonRequestBehavior.AllowGet);
            }
        }


        [HttpGet]
        public JsonResult getCurrencies() {
            try
            {
                var c = new Currency { }.get();

                return Json(new { status = true, msg = c },JsonRequestBehavior.AllowGet);
            }
            catch (Exception e) {
                return Json(new { status = false, msg = e.Message },JsonRequestBehavior.AllowGet);
            }
        }

        [HttpPost]
        public JsonResult postExchangeRates(int CUR, string crate, string dte_) {
            try
            {
                var obb = new ExchangeRate
                {
                    objCurrency = new Currency { Id = CUR },
                    x_rate = Convert.ToDouble(crate),
                    dte = dte_,
                    isCurrent = 1
                };

                return Json(new { status = obb.Add() },JsonRequestBehavior.AllowGet);
            }
            catch (Exception e) {
                return Json(new { status = false, msg = e.Message },JsonRequestBehavior.AllowGet);
            }
        }

        [HttpGet]
        public JsonResult getExchangeRates(int FLG) {
            try
            {
                var xchange = new ExchangeRate { }.get(FLG);

                return Json(new { status = true, msg = xchange },JsonRequestBehavior.AllowGet);
            }
            catch (Exception e) {
                return Json(new { status = false },JsonRequestBehavior.AllowGet);
            }
        }

    }
}
