using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

using System.IO;
using Pickups.mtier.xlCRUD;
using Pickups.mtier.repos;
using System.Diagnostics;

using Pickups.mtier.notifications;
using Pickups.mtier.businessObjects;

using System.Configuration;

namespace Pickups.Controllers
{
    public class UploadController : Controller
    {
        [AcceptVerbs(HttpVerbs.Post)]
        public ActionResult UploadRoutes(string caption, string TTYPE)
        {
            List<Routes> successfulInsertions = new List<Routes>();
            List<Routes> failedInsertions = new List<Routes>();

            string[] supportedTypes = new string[]{
                "xlsx", "xls"
            };

            try
            {
                HttpPostedFileBase postedFile = Request.Files["routes-file-path"];

                if (postedFile.ContentLength > 0) 
                {
                    string x = Path.GetExtension(postedFile.FileName);
                    var fileName = Path.GetFileName(postedFile.FileName);
                    var path = Path.Combine(Server.MapPath("~/App_Data/uploads"), fileName);

                    postedFile.SaveAs(path);

                    var obj = new Routes { filePath = path };
                    var dlist = obj.getRoutesFromExcel();

                    var success = 0; var failed = 0;

                    
                    var pObj = new Pickups.mtier.repos.Process {
                        processType = @"ROUTE",
                        processName = caption
                    };

                    if (pObj.Add())
                    {
                        foreach (var d in dlist)
                        {
                            var bln = new VehicleRoutes
                            {
                                objCompany = new Company { branchCode = d.branch },
                                objRoute = d,
                                objProcess = pObj
                            }.Load();

                            if (bln) { success++; successfulInsertions.Add(d); } else { failed++; failedInsertions.Add(d); }
                        }
                    }
                    else { return new JsonResult() { ContentType = "text/html", Data = new { success = false, error = "File upload error" } }; }
                    
                }

                return new JsonResult() { ContentType = "text/html", Data = new { success = true, msg = "File uploaded successfully", good = successfulInsertions, bad = failedInsertions  } };
            }
            catch (Exception e)
            {
                System.Diagnostics.Debug.Print(e.Message);
                return new JsonResult() { ContentType = "text/html", Data = new { success = false, error = "File upload error" } };
            }
        }

        [AcceptVerbs(HttpVerbs.Post)]
        public ActionResult UploadSpecie(string caption) {

            List<Specie> successfulInsertions = new List<Specie>();
            List<Specie> failedInsertions = new List<Specie>();

            string[] supportedTypes = new string[]{
                "xlsx", "xls"
            };

            try
            {
                HttpPostedFileBase postedFile = Request.Files["specie-name"];
                if (postedFile.ContentLength > 0)
                {
                    string x = Path.GetExtension(postedFile.FileName);
                    var fileName = Path.GetFileName(postedFile.FileName);
                    var path = Path.Combine(Server.MapPath("~/App_Data/uploads"), fileName);

                    postedFile.SaveAs(path);

                    var specieObj = new Specie { filePath = path };
                    var specieList = specieObj.getSpecieFromExcel();

                    var success = 0; var failed = 0;

                    var pObj = new Pickups.mtier.repos.Process
                    {
                        processType = @"SPECIEMOV",
                        processName = caption
                    };

                    if (pObj.Add())
                    {
                        //upload specie movement data
                        foreach (var sl in specieList)
                        {
                            var bln = new SpecieMovement
                            {
                                objCompany = new Company { branchCode = sl.branch },
                                objRoute = sl.objRoute,
                                objProcess = pObj,
                                objSpecie = sl
                            }.Load();

                            if (bln) { success++; successfulInsertions.Add(sl); } else { failed++; failedInsertions.Add(sl); }
                        }
                    }
                    else { return new JsonResult() { ContentType = "text/html", Data = new { success = false, error = "File upload error" } }; }
                }
                else { return new JsonResult() { ContentType = "text/html", Data = new { success = false, error = "File upload error" } }; };

                return new JsonResult() { ContentType = "text/html", Data = new { success = true, msg = "Specie Movement file uploaded successfully", good = successfulInsertions, bad = failedInsertions } };
            }
            catch (Exception e) {
                return new JsonResult() { ContentType = "text/html", Data = new { success = false, error = "File upload error" } };
            }
        }

        [AcceptVerbs(HttpVerbs.Post)]
        public ActionResult UploadPickups(string caption) {
            List<Pickups.mtier.xlCRUD.CashColl> successfulInsertions = new List<Pickups.mtier.xlCRUD.CashColl>();
            List<Pickups.mtier.xlCRUD.CashColl> failedInsertions = new List<Pickups.mtier.xlCRUD.CashColl>();

            string[] supportedTypes = new string[]{
                "xlsx", "xls"
            };

            try
            {
                HttpPostedFileBase postedFile = Request.Files["file-path"];
                if (postedFile.ContentLength > 0)
                {
                    string x = Path.GetExtension(postedFile.FileName);
                    var fileName = Path.GetFileName(postedFile.FileName);
                    var path = Path.Combine(Server.MapPath("~/App_Data/uploads"), fileName);

                    postedFile.SaveAs(path);

                    //var o = new Pickups.mtier.xlCRUD.Pickups { filePath = path };
                    //var oList = o.getPickupFromExcel();
                    var o = new Pickups.mtier.xlCRUD.CashColl { filePath = path };
                    var oList = o.getCollectionsFromExcel();

                    var success = 0; var failed = 0;

                    var pObj = new Pickups.mtier.repos.Process
                    {
                        processType = @"PICKUPS",
                        processName = caption
                    };

                    if (pObj.Add())
                    {
                        //upload specie movement data
                        foreach (var pck in oList)
                        {
                            var bln = new BuillionData
                            {
                                objCompany = new Company { branchCode = pck.branch },
                                objProcess = pObj,
                                objCashCollection = pck
                                //objPickup = pck
                            }.Load(path);

                            if (bln) { success++; successfulInsertions.Add(pck); } else { failed++; failedInsertions.Add(pck); }
                        }
                    }
                    else { return new JsonResult() { ContentType = "text/html", Data = new { success = false, error = "File upload error" } }; }
                }

                return new JsonResult() { ContentType = "text/html", Data = new { success = true, msg = "Specie Movement file uploaded successfully", good = successfulInsertions, bad = failedInsertions } };
            }
            catch (Exception e)
            {
                return new JsonResult() { ContentType = "text/html", Data = new { success = false, error = "File upload error" } };
            }
        }

        [AcceptVerbs(HttpVerbs.Post)]
        public ActionResult UploadTellerBills(string caption) { 
            //method is used for the upload of teller bills
            List<TellerBills> s = new List<TellerBills>();
            List<TellerBills> f = new List<TellerBills>();

            string[] supportedTypes = new string[]{
                    "xlsx", "xls"
            };

            try
            {
                HttpPostedFileBase postedFile = Request.Files["teller-name"];
                if (postedFile.ContentLength > 0)
                {
                    string x = Path.GetExtension(postedFile.FileName);
                    var fileName = Path.GetFileName(postedFile.FileName);
                    var path = Path.Combine(Server.MapPath("~/App_Data/uploads"), fileName);

                    postedFile.SaveAs(path);

                    var obj = new TellerBills { filePath = path };
                    var objList = obj.getTellerBillsFromExcel();

                    var pObj = new Pickups.mtier.repos.Process
                    {
                        processType = @"TELLR",
                        processName = caption
                    };

                    if (pObj.Add())
                    {
                        //upload teller bills data
                        foreach (var o in objList)
                        {
                            var bln = new Teller
                            {
                                objCompany = new Company { branchCode = o.companyCode },
                                location = o.Location,
                                tellerNumbers = o.TellerNumber,
                                tellerNames = o.TellerNames,
                                tRate = o.Rate,
                                amount = o.Amt,
                                objProcess = pObj
                            }.Load();

                            if (bln) { s.Add(o); } else { f.Add(o); }
                        }

                        //return here
                        return new JsonResult() { ContentType = "text/html", Data = new { success = true, msg = "Specie Movement file uploaded successfully", good = s, bad = f } };
                    }
                    else { return new JsonResult() { ContentType = "text/html", Data = new { success = false, error = "File upload error" } }; }
                }
                else { return new JsonResult(){ ContentType = "text/html", Data = new { success = false, error = "File upload error" } }; };

            }
            catch (Exception e) 
            {
                Debug.Print(e.Message);
                return Json(new { status = false, msg = e.Message },JsonRequestBehavior.AllowGet);
            }
        }

        [AcceptVerbs(HttpVerbs.Post)]
        public ActionResult UploadDHLSourceData(string caption) {
            try
            {
                List<DHLSourceUpload> s = new List<DHLSourceUpload>();
                List<DHLSourceUpload> f = new List<DHLSourceUpload>();

                string[] supportedTypes = new string[]{
                    "xlsx", "xls"
                };

                HttpPostedFileBase postedFile = Request.Files["DHL-name"];

                if (postedFile.ContentLength > 0)
                {
                    string x = Path.GetExtension(postedFile.FileName);
                    var fileName = Path.GetFileName(postedFile.FileName);
                    var path = Path.Combine(Server.MapPath("~/App_Data/uploads"), fileName);

                    postedFile.SaveAs(path);

                    var obj = new DHLSourceUpload { filePath = path };
                    var dhlList = obj.getDHLRecordsFromExcel();

                    var pObj = new Pickups.mtier.repos.Process
                    {
                        processType = @"DHL",
                        processName = caption
                    };

                    if (pObj.Add())
                    {
                        //upload DHL data
                        foreach (var d in dhlList)
                        {
                            var bln = new DHLData
                            {
                                objCompany = new Company { branchCode = d.companyCode }.getCompanyUsingCode(),
                                objProcess = pObj,
                                AirWayBillNo = d.airwayBillNo,
                                Shipper = d.shipper,
                                Receipient = d.receipient,
                                WeightInKilograms = d.weightInKg,
                                AirwayBillDate = d.airwayBillDate,
                                Charge = d.charge,
                                Discount = d.discount,
                                SubTotal = d.subTotal,
                                VAT = d.valueAddedTax,
                                NationalHealthLevy = d.NHIL,
                                NetAmount = d.netAmount,
                                Insurance = d.insurance,
                                GrandTotal = d.total,
                                Comments = d.remarks
                            }.Add();

                            if (bln) { s.Add(d); } else { f.Add(d); }
                        }

                        //return here
                        return new JsonResult() { ContentType = "text/html", Data = new { success = true, msg = "DHL Upload file uploaded successfully", good = s, bad = f } };
                    }
                    else { return new JsonResult() { ContentType = "text/html", Data = new { success = false, error = "File upload error" } }; }
                }
                else { return new JsonResult() { ContentType = "text/html", Data = new { success = false, error = "File upload error" } }; }
            }
            catch (Exception e) {
                Debug.Print(e.Message);
                return Json(new { status = false, msg = "Error" },JsonRequestBehavior.AllowGet);
            }
        }

        [AcceptVerbs(HttpVerbs.Post)]
        public ActionResult UploadDHLData(string caption) { 
            //method is used in uploading DHL data..MISNOMER..actionResult is for IAS
            try
            {
                List<DHLUpload> s = new List<DHLUpload>();
                List<DHLUpload> f = new List<DHLUpload>();

                string[] supportedTypes = new string[]{
                    "xlsx", "xls"
                };

                HttpPostedFileBase postedFile = Request.Files["IAS-name"];

                if (postedFile.ContentLength > 0) {
                    string x = Path.GetExtension(postedFile.FileName);
                    var fileName = Path.GetFileName(postedFile.FileName);
                    var path = Path.Combine(Server.MapPath("~/App_Data/uploads"), fileName);

                    postedFile.SaveAs(path);

                    var obj = new DHLUpload { filePath = path };
                    var dhlList = obj.getDHLRecordsFromExcel();

                    var pObj = new Pickups.mtier.repos.Process
                    {
                        processType = @"IAS",
                        processName = caption
                    };


                    if (pObj.Add())
                    {
                        //upload IAS data
                        foreach (var d in dhlList)
                        {
                            var bln = new DHL
                            {
                                objCompany = new Company { branchCode = d.companyCode }.getCompanyUsingCode(),
                                objProcess = pObj,
                                AirWayBillNo = d.airwayBillNo,
                                Shipper = d.shipper,
                                Receipient = d.receipient,
                                WeightInKilograms = d.weightInKg,
                                AirwayBillDate = d.airwayBillDate,
                                Charge = d.charge,
                                Discount = d.discount,
                                SubTotal = d.subTotal,
                                VAT = d.valueAddedTax,
                                NationalHealthLevy = d.NHIL,
                                NetAmount = d.netAmount,
                                Insurance = d.insurance,
                                GrandTotal = d.total,
                                Comments = d.remarks
                            }.Add();

                            if (bln) { s.Add(d); } else { f.Add(d); }
                        }

                        return new JsonResult() { ContentType = "text/html", Data = new { success = true, msg = "DHL file uploaded successfully", good = s, bad = f } };
                    }
                    else
                    { //return here
                        return new JsonResult() { ContentType = "text/html", Data = new { success = true, msg = "File upload error"} };
                    }
                }
                else { return new JsonResult() { ContentType = "text/html", Data = new { success = false, error = "File upload error" } }; };
            }
            catch { return Json(new { status = false, msg = "Error" },JsonRequestBehavior.AllowGet); }
        }

        [HttpGet]
        public JsonResult PreviewUploadedRoutes(string UPL) { 
            try
            {
                return Json(true);
            }
            catch (Exception e) {
                Debug.Print(e.Message);
                return Json(false);
            }
        }

        public JsonResult PersistUploadedRoutes(string UPL) { 
            try
            {
                var obj = new VehicleRoutes { };
                if (!obj.isLoaded(UPL))
                {
                    return Json(new { status = obj.PersistRoutesData(UPL) }, JsonRequestBehavior.AllowGet);
                }
                else {
                    return Json(new { status = false, msg = string.Format("{0} already loaded into datastore",UPL) },JsonRequestBehavior.AllowGet);
                }
                
            }
            catch (Exception e) {
                Debug.Print(e.Message);
                return Json(new { status = false, msg = e.Message },JsonRequestBehavior.AllowGet);
            }
        }

        public JsonResult PersistSpecieMovementData(string UPL) {
            try
            {
                var o = new SpecieMovement { };
                if (!o.isLoaded(UPL))
                {
                    return Json(new { status = o.PersistSpecieData(UPL) }, JsonRequestBehavior.AllowGet);
                }
                else {
                    return Json(new { status = false, msg = string.Format("{0} already loaded into datastore", UPL) }, JsonRequestBehavior.AllowGet);
                }
            }
            catch (Exception e) {
                Debug.Print(e.Message);
                return Json(new { status = false, msg = e.Message },JsonRequestBehavior.AllowGet);
            }
        }

        public JsonResult PersistPickupData(string UPL) {
            try
            {
                var b = new BuillionData{ };
                if (!b.isLoaded(UPL))
                {
                    return Json(new { status = b.PersistPickupData(UPL) }, JsonRequestBehavior.AllowGet);
                }
                else {
                    return Json(new { status = false, msg = string.Format("{0} already loaded into datastore",UPL) },JsonRequestBehavior.AllowGet);
                }
            }
            catch (Exception e) {
                return Json(new { status = false, msg = e.Message },JsonRequestBehavior.AllowGet);
            }
        }

        public JsonResult ApproveMonthlyCollection(string[] items) {
            try
            {
                var i = 0; var f = 0;
                foreach (var d in items) {
                    var dd = d.Split(',');

                    var b = new BuillionData { };
                    if (b.getApprovalStatus(int.Parse(dd[0].ToString())))
                    {
                        if (new BuillionData { }.ApproveCashCollectionData(int.Parse(dd[0].ToString()), dd[1].ToString(), int.Parse(Session["official_Id"].ToString())))
                        {
                            i++;
                        }
                        else { f++; }
                    }
                    else { }
                }

                if (i > 0)
                {
                    //fire notification to branches that authorization has been given at the head office

                }

                return Json(new { status = true, msg = string.Format("Head Office Approval successful: Total Transactions: {0}\r\nSuccessful Transactions: {1}\r\nFailed Transactions: {2}", items.Length.ToString(), i.ToString(), f.ToString()) }, JsonRequestBehavior.AllowGet);
 
            }
            catch (Exception e) {
                return Json(new { status = false, msg = e.Message },JsonRequestBehavior.AllowGet);
            }
        }
        
        public JsonResult AuthorizeBranchPickup(string[] items) { 
            //method is used to authorize branch pickups
            try
            {
                var i = 0; var f = 0;
                foreach (var d in items) {
                    var dd = d.Split(',');
                    var b = new BuillionData { };
                    if (b.getAuthorizationStatus(int.Parse(dd[0].ToString())))
                    {
                        if (new BuillionData { }.AuthorizePickupData(int.Parse(dd[0].ToString()), dd[1].ToString(), int.Parse(Session["official_Id"].ToString())))
                        {
                            i++;
                        }
                        else { f++; }
                    }
                    else {  }
                }

                if (i > 0) { 
                    //fire notification to head office that authorization has been given at the branch level

                }

                return Json(new { status = true, msg = string.Format("Branch Authorization successful: Total Transactions: {0}\r\nSuccessful Transactions: {1}\r\nFailed Transactions: {2}", items.Length.ToString(), i.ToString(), f.ToString()) }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e) {
                return Json(new { status = false, msg = e.Message },JsonRequestBehavior.AllowGet);
            }
        }

        public JsonResult AuthorizeSpecieData(string[] items) { 
            //method is used for authorizing specie data
            try
            {
                var i = 0; var f = 0;
                foreach (var dd in items) {
                    var d = dd.Split(',');

                    var s = new SpecieMovement { };
                    if (s.getApprovalStatus(int.Parse(d[0].ToString())))
                    {
                        if (s.AuthorizeSpecieMovementData(int.Parse(d[0].ToString()), d[1].ToString(), int.Parse(Session["official_Id"].ToString())))
                        {
                            i++;
                        }
                        else { f++; }
                    }
                    else { return Json(new { status = true, msg = @"File has already been approved, awaiting authorization from Head Office" },JsonRequestBehavior.AllowGet); }
                }

                if (i > 0) { 
                    //fire notification to head office that branch has approved the uploaded specie movement data
                    var b = new BranchOperative 
                    { 
                        Id = int.Parse(Session["official_Id"].ToString()) 
                    }.getOperative();

                    var ttle = string.Format("SPECIE APPROVAL FOR {0}", b.objCompany.branchName);
                    var cntent = string.Format(@"Hello Team\r\nThis is to inform you that {0} has approved their Specie Movement Data for the month\r\nKindly log in to the Courier System to authorize\r\r\nWarm Regards,\r\n{1}",b.objCompany.branchName,ConfigurationManager.AppSettings["sendingName"].ToString());

                    var obj = new Notification
                    {
                        objSender = new Sender { 
                            smtp = ConfigurationManager.AppSettings["smtp"].ToString(),
                            smtpPort = int.Parse(ConfigurationManager.AppSettings["smtpServerPort"].ToString()),
                            smtpUserCredential = ConfigurationManager.AppSettings["userCredential"].ToString(),
                            smtpPassword = ConfigurationManager.AppSettings["passwordCredential"].ToString()
                        }
                    };
                    var bln = obj.pushHeadOfficeNotification(ttle, cntent);
                }

                return Json(new { status = true, msg = string.Format("Branch Approval successful: Total Transactions: {0}\r\nSuccessful Transactions: {1}\r\nFailed Transactions: {2}", items.Length.ToString(), i.ToString(), f.ToString()) }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e) {
                Debug.Print(e.Message);
                return Json(new { status = true, msg = e.Message },JsonRequestBehavior.AllowGet);
            }
        }

        public JsonResult ApproveMonthlySpecieMovement(string[] items)
        {
            try
            {
                var i = 0; var f = 0;
                foreach (var dd in items)
                {
                    var d = dd.Split(',');

                    var s = new SpecieMovement { };
                    if (s.getAuthorizingStatus(int.Parse(d[0].ToString())))
                    {
                        if (s.ApproveSpecieMovementData(int.Parse(d[0].ToString()), d[1].ToString(), int.Parse(Session["official_Id"].ToString())))
                        {
                            i++;
                        }
                        else { f++; }
                    }
                    else { return Json(new { status = true, msg = @"File has already been authorized at Head Office" }, JsonRequestBehavior.AllowGet); }
                }

                if (i > 0)
                {
                    //fire notification to head office that branch has approved the uploaded specie movement data

                }

                return Json(new { status = true, msg = string.Format("Head Office Approval successful: Total Transactions: {0}\r\nSuccessful Transactions: {1}\r\nFailed Transactions: {2}", items.Length.ToString(), i.ToString(), f.ToString()) }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                return Json(new { status = false, msg = e.Message }, JsonRequestBehavior.AllowGet);
            }
        }

        [HttpPost]
        public JsonResult PersistDHLData(string UPL) {
            try
            {
                var oDHL = new DHL { };
                if (!oDHL.isLoaded(UPL))
                {
                    return Json(new { status = oDHL.PersistDHLData(UPL) },JsonRequestBehavior.AllowGet);
                }
                else { return Json(new { status= false, msg = string.Format("The File {0} has already been loaded into the datastore",UPL) },JsonRequestBehavior.AllowGet); }
            }
            catch (Exception e) {
                return Json(new { status = false, msg = e.Message },JsonRequestBehavior.AllowGet);
            }
        }

        [HttpPost]
        public JsonResult PersistDHLCorrectData(string UPL) {
            try
            {
                var obj = new DHLData { };
                if (!obj.isLoaded(UPL))
                {
                    return Json(new { status = obj.PersistDHLData(UPL) }, JsonRequestBehavior.AllowGet);
                }
                else { return Json(new { status = false, msg = string.Format("The File {0} has already been loaded into the datastore",UPL) },JsonRequestBehavior.AllowGet); }
            }
            catch(Exception e) {
                return Json(new { status = false, msg = e.Message },JsonRequestBehavior.AllowGet);
            }
        }

        public JsonResult DeleteDHILData(string UPL) { 
            //deletes DHL data..data must not have been persisted
            try
            {
                var d = new DHL { };
                if (!d.isLoaded(UPL)) {
                    return Json(new { status = d.DeleteDHLFile(UPL) },JsonRequestBehavior.AllowGet);
                }
                else { return Json(new { status = false, msg = string.Format("The File {0} has already been committed and cannot be deleted. See Administrator", UPL) }, JsonRequestBehavior.AllowGet); }
            }
            catch { return Json(new { status = false },JsonRequestBehavior.AllowGet); }
        }

        public JsonResult DeleteDHLCorrectData(string UPL) {
            try
            {
                var dd = new DHLData { };
                if (!dd.isLoaded(UPL))
                {
                    return Json(new { status = dd.DeleteDHLFile(UPL) }, JsonRequestBehavior.AllowGet);
                }
                else { return Json(new { status = false, msg = string.Format("The File {0} has already been committed and cannot be deleted. See Administrator",UPL) },JsonRequestBehavior.AllowGet); }
            }
            catch 
            {
                return Json(new { status = false },JsonRequestBehavior.AllowGet);
            }
        }

        [HttpPost]
        public JsonResult PersistTellersBillData(string UPL) { 
            //method is responsible for persisting the teller bill for the month
            try
            {
                var t = new Teller { };
                if (!t.isLoaded(UPL))
                {
                    return Json(new { status = t.PersistTellerData(UPL) },JsonRequestBehavior.AllowGet);
                }
                else { return Json(new { status = false, msg = string.Format("The File {0} has already been loaded into the datastore",UPL) },JsonRequestBehavior.AllowGet); }
            }
            catch (Exception e) {
                return Json(new { status = false, msg = e.Message },JsonRequestBehavior.AllowGet);
            }
        }

        public JsonResult DeleteTellersBillData(string UPL) {
            try
            {
                var t = new Teller { };
                if (!t.isLoaded(UPL))
                {
                    return Json(new { status = t.DeleteFile(UPL) },JsonRequestBehavior.AllowGet);
                }
                else { return Json(new { status = false, msg = string.Format("The File {0} has already been committed and cannot be deleted. See Administrator",UPL) },JsonRequestBehavior.AllowGet); }
            }
            catch (Exception e) {
                return Json(new { status = false, msg = e.Message },JsonRequestBehavior.AllowGet);
            }
        }

        [HttpGet]
        public JsonResult ApproveTellerBillCollections(string[] items)
        {
            //method is used for approving teller bill collections
            try
            {
                var i = 0; var f = 0;
                foreach (var d in items) {
                    var dd = d.Split(',');

                    var t = new Teller{};
                    if (t.getApprovingStatus(int.Parse(dd[0].ToString()))) {                        
                        if (t.ApproveTellerData(int.Parse(dd[0].ToString()), dd[1].ToString(), int.Parse(Session["official_Id"].ToString())))
                        {
                            i++;
                        }
                        else { f++; }                       
                    }
                    else { return Json(new { status = true, msg = @"File has already been approved, awaiting authorization from Head Office" }, JsonRequestBehavior.AllowGet); }
                }

                if (i > 0)
                {
                    //fire notification to head office that branch has approved the uploaded specie movement data

                }

                return Json(new { status = true, msg = string.Format("Branch Approval successful: Total Transactions: {0}\r\nSuccessful Transactions: {1}\r\nFailed Transactions: {2}", items.Length.ToString(), i.ToString(), f.ToString()) }, JsonRequestBehavior.AllowGet);

            }
            catch (Exception e)
            {
                return Json(new { status = false, msg = e.Message }, JsonRequestBehavior.AllowGet);
            }
        }

        [HttpGet]
        public JsonResult AuthorizeTellerBillCollections(string[] items) { 
            //method is used for authorizing teller bill collections
            try
            {
                var i = 0; var f = 0;
                foreach (var d in items) {
                    var dd = d.Split(',');

                    var t = new Teller { };
                    if (t.getAuthorizingStatus(int.Parse(dd[0].ToString())))
                    {
                        if (t.AuthorizeTellerData(int.Parse(dd[0].ToString()), dd[1].ToString(), int.Parse(Session["official_Id"].ToString())))
                        {
                            i++;
                        }
                        else { f++; }
                    }
                    else { return Json(new { status = true, msg = @"File has already been authorized" },JsonRequestBehavior.AllowGet); }
                }

                if (i > 0) { 
                    //fire notifications to branch of authorized state

                }

                return Json(new { status = true, msg = string.Format("Head Office Authorization successful: Total transactions: {0}\r\nSuccessful Transactions: {1}\r\nFailed Transactions: {2}",items.Length.ToString(),i.ToString(),f.ToString()) },JsonRequestBehavior.AllowGet);
            }
            catch (Exception e) {
                return Json(new { status = false, msg = e.Message },JsonRequestBehavior.AllowGet);
            }
        }

        [HttpPost]
        public JsonResult ApproveCorrectDHLData(string Fn) {
            try
            {
                var i = 0; var f = 0;
               
                var obj = new DHLData { };
                if (obj.getApprovingStatus(Fn))
                {
                    if (obj.ApproveCorrectDHLData(Fn, int.Parse(Session["official_Id"].ToString())))
                    {
                        i++;
                    }
                    else { f++; }
                }
                else { return Json(new { status = true, msg = @"File has already been approved at Branch Level" },JsonRequestBehavior.AllowGet); }                

                if (i > 0) { 
                    //fire notifications to branch if authorized state

                }

                return Json(new { status = true, msg = string.Format("Branch Approval successful") }, JsonRequestBehavior.AllowGet);
            }
            catch(Exception e) {
                return Json(new { status = false, msg = e.Message },JsonRequestBehavior.AllowGet);
            }
        }

        [HttpGet]
        public JsonResult ApproveIASData(string[] items) {
            try
            {
                var i = 0; var f = 0;
                foreach (var itm in items) {
                    var x = itm.Split(',');

                    var o = new DHL { };
                    if (o.getApprovingStatus(int.Parse(x[0].ToString())))
                    {
                        if (o.ApproveIASData(int.Parse(x[0].ToString()), int.Parse(Session["official_Id"].ToString())))
                        {
                            i++;
                        }
                        else { f++; }
                    }
                    else { return Json(new { status = true, msg = @"File has already been approved at Branch Level" },JsonRequestBehavior.AllowGet); }
                }

                if (i > 0) { 
                    //fire notifications to branch of authorized state

                }

                return Json(new { status = true, msg = string.Format("Branch Approval successful: Total Transactions = {0}\r\nSuccessful Transactions = {1}\r\nFailed Transactions = {2}",items.Length.ToString(),i.ToString(),f.ToString()) },JsonRequestBehavior.AllowGet);
            }
            catch {
                return Json(new { status = false },JsonRequestBehavior.AllowGet);
            }
        }

        [HttpPost]
        public JsonResult AuthorizeDHLData(string Fn) {
            try
            {
                var o = new DHLData { };
                if (o.getAuthorizationStatus(Fn))
                {                    
                    return Json(new { status = o.AuthorizeDHLData(Fn, int.Parse(Session["official_Id"].ToString())), msg = @"True" }, JsonRequestBehavior.AllowGet);
                }
                else { return Json(new { status = true, msg = @"File has already been authorized at Head Office" },JsonRequestBehavior.AllowGet); }
            }
            catch 
            {
                return Json(new { status = false, msg = @"Error" },JsonRequestBehavior.AllowGet);
            }
        }

        [HttpGet]
        public JsonResult AuthorizeIASFedexData(string[] items) {
            try
            {
                var i = 0; var f = 0;
                foreach (var itm in items) {
                    var x = itm.Split(',');

                    var o = new DHL { };
                    if (o.getAuthorizationStatus(int.Parse(x[0].ToString())))
                    {
                        if (o.AuthorizeIASFedexData(int.Parse(x[0].ToString()), int.Parse(Session["official_Id"].ToString())))
                        {
                            i++;
                        }
                        else { f++; }
                    }
                    else { return Json(new { status = true, msg = @"File has already been approved at Head Office" },JsonRequestBehavior.AllowGet); }
                }

                if (i > 0) { 
                    //fire notifications to branch and head office alike

                }

                return Json(new { status = true, msg = string.Format("Head Office authorization successful: Total Transactions = {0},\r\nSuccessful Transactions = {1},\r\nFailed Transactions = {2}", items.Length.ToString(), i.ToString(), f.ToString()) }, JsonRequestBehavior.AllowGet);
            }
            catch 
            {
                return Json(new { status = false },JsonRequestBehavior.AllowGet);
            }
        }

        public JsonResult DeletePickupData(string UPL) {
            try
            {
                var p = new BuillionData { };
                if (!p.isLoaded(UPL))
                {
                    return Json(new { status = p.DeleteFile(UPL) },JsonRequestBehavior.AllowGet);
                }
                else { return Json(new { status = false, msg = string.Format("{0} has already been committed and cannot be deleted. See Administrator",UPL) },JsonRequestBehavior.AllowGet); }
            }
            catch (Exception e) {
                return Json(new { status = false, msg = e.Message },JsonRequestBehavior.AllowGet);
            }
        }

        

    }
}
