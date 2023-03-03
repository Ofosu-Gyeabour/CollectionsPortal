using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

using System.Configuration;

using Pickups.mtier.notifications;
using Pickups.mtier.analytics;

using System.IO;
using System.Text;
using System.Globalization;
using System.Diagnostics;

using Microsoft.Reporting.WebForms;

namespace Pickups.Controllers
{
    public class DashController : Controller
    {
        public ActionResult Index()
        {
            return View();
        }

        public JsonResult getDashValues() { 
            try
            {
                var d = new DashStatistics { };
                d.ComputeValues();
                return Json(new { status = true, routesValue = d.routesValue , tellerDta = d.tellerNumber, 
                    pickupDta = d.pickupClients, activeUsrs = d.activeUsers, loggedUsrs = d.loggedUsers, topTenPickups = d.topTenCashPickup },JsonRequestBehavior.AllowGet);
            }
            catch 
            {
                return Json(new { status = false },JsonRequestBehavior.AllowGet);
            }
        }

        [HttpGet]
        public JsonResult getCourierSummary(string dF, string dT, string statusType, string courierType) {
            try
            {
                String format = "dd/MM/yyyy";
                DateTime dateFrom = DateTime.ParseExact(dF, format, CultureInfo.InvariantCulture, DateTimeStyles.None);
                DateTime dateTo = DateTime.ParseExact(dT, format, CultureInfo.InvariantCulture, DateTimeStyles.None);

                List<CourierAnalytics> res = new List<CourierAnalytics>();

                var cc = new CourierAnalytics { 
                    reportType = courierType,
                    dateFrom = dateFrom,
                    dateTo = dateTo,
                    reportStatus = statusType
                };

                if (cc.reportType == "DHL") {
                    res = cc.getDHLSummaryReport();
                } 
                else if(cc.reportType == "IAS") {
                    res = cc.getFedexSummaryReport();
                }

                return Json(new { status = true, msg = res },JsonRequestBehavior.AllowGet);
            }
            catch 
            {
                return Json(new { status = false, msg = @"Error" },JsonRequestBehavior.AllowGet);
            }
        }

        [HttpGet]
        [ActionName("CHECKPointCSVReport")]
        public ActionResult CHECKPointCSVReport() {
            try
            {
                StringBuilder sb = new StringBuilder();

                try
                {
                    sb.Append("Company_Code" + "," + "Company_Name" + "," + "Currency_Symbol" + "," + "ChequeBookCode" + "," + "ChequeBookType" + "," + "ChequeBookCount");
                    sb.Append("\r\n");

                    var k = 2;

                    foreach (var item in CheckPointAnalytics.chkData) {
                        sb.Append(item.CompanyCode + "," + item.CompanyName + "," + item.currencySymbol + "," + item.BookCode + "," + item.BookType + "," + item.BookCount.ToString());
                        sb.Append("\r\n");

                        k += 1;
                    }

                    Response.Clear();
                    Response.ContentType = "text/csv";
                    Response.AddHeader("content-disposition", "attachment;filename=CHECKPointCSVReport" + ".csv");
                    Response.Write(sb);
                    Response.End();


                    return File("test.csv", "text/csv");

                }
                catch (Exception exc) { Debug.Print(exc.Message); return Json(new { errormsg = exc.Message },JsonRequestBehavior.AllowGet); }
            }
            catch (Exception e) {
                Debug.Print(e.Message);
                return Json(new { errormsg = e.Message });
            }
        }

        [HttpGet]
        [ActionName("DHLSummaryCSvReport")]
        public ActionResult DHLSummaryCSvReport()
        {
            try
            {
                StringBuilder sb = new StringBuilder();

                try
                {
                    sb.Append("Details" + "," + "Charge" + "," + "Discount" + "," + "Sub-Total" + "," + "VAT" + "," + "NHIL" + "," + "Insurance" + "," + "NetAmount" + "," + "AmountDue");
                    sb.Append("\r\n");

                    var k = 2;

                    foreach (var item in CourierAnalytics.tData)
                    {
                        sb.Append(item.branchId + "," + item.charge + "," + item.discount + "," + item.subTotal + "," + item.VAT + "," + item.NHIL + "," + item.Insurance + ","  + item.netAmount + "," + item.amountDue);
                        sb.Append("\r\n");

                        k += 1;
                    }

                    Response.Clear();
                    Response.ContentType = "text/csv";
                    Response.AddHeader("content-disposition", "attachment;filename=CourierSummaryReport" + ".csv");
                    Response.Write(sb);
                    Response.End();


                    return File("test.csv", "text/csv");

                }
                catch (Exception ex) { Debug.Print(ex.Message); return Json(new { errormsg = ex.Message }, JsonRequestBehavior.AllowGet); }
            }
            catch (Exception exc) { Debug.Print(exc.Message); return Json(new { errormsg = exc.Message }); }
        }

        [HttpGet]
        [ActionName("TellerSummaryCSvReport")]
        public ActionResult TellerSummaryCSvReport() {
            try
            {
                StringBuilder sb = new StringBuilder();

                try
                {
                    sb.Append("Details" + "," + "Company_Id" + "," + "Branch" + "," + "Location" + "," + "Rate" + "," + "Amount" + "," + "Branch_Approver" + "," + "HO_Authorizer");
                    sb.Append("\r\n");

                    var k = 2;

                    foreach (var item in TellerAnalytics.tellerResultant)
                    {
                        sb.Append(k.ToString() + "," + item.branchId + "," + item.branchName + "," + item.Location + "," + item.rate + "," + item.Amount + "," + item.Branch_Approver + "," + item.HO_Authorizer);
                        sb.Append("\r\n");

                        k += 1;
                    }

                    Response.Clear();
                    Response.ContentType = "text/csv";
                    Response.AddHeader("content-disposition", "attachment;filename=TellerSummaryCSvReport" + ".csv");
                    Response.Write(sb);
                    Response.End();


                    return File("test.csv", "text/csv");

                }
                catch (Exception ex) { Debug.Print(ex.Message); return Json(new { errormsg = ex.Message }, JsonRequestBehavior.AllowGet); }
            }
            catch (Exception exc) { Debug.Print(exc.Message); return Json(new { errormsg = exc.Message }); }
        }

        [HttpGet]
        public JsonResult getCollectionSummary(string PROC) {
            try
            {
                var collectionList = new CollectionAnalytics { processName = PROC }.getCollectionSummary();
                return Json(new { status = true, msg = collectionList },JsonRequestBehavior.AllowGet);
            }
            catch 
            {
                return Json(new { status = false, msg = @"Error" },JsonRequestBehavior.AllowGet);
            }
        }

        [HttpGet]
        [ActionName("CollectionCSvReport")]
        public ActionResult CollectionCSvReport() {
            try
            {
                StringBuilder sb = new StringBuilder();

                try
                {
                    sb.Append("Company" + "," + "BranchName" + "," + "CustomerName" + "," + "CustomerLocation" + "," + "Frequency" + "," + "Rate" + "," + "Amount" + "," + "Total" + "," + "BranchApproving_Officer" + "," + "HO_Authorizing_Officer");
                    sb.Append("\r\n");

                    var k = 2;

                    foreach (var item in CollectionAnalytics.tColl)
                    {
                        sb.Append(item.branchId + "," + item.branchName + "," + item.customerName + "," + item.customerLocation + "," + item.frequency + "," + item.rate + "," + item.amount + "," + item.total + "," + item.BranchApprover + "," + item.HOAuthorizer);
                        sb.Append("\r\n");

                        k += 1;
                    }

                    Response.Clear();
                    Response.ContentType = "text/csv";
                    Response.AddHeader("content-disposition", "attachment;filename=CollectionSummaryReport" + ".csv");
                    Response.Write(sb);
                    Response.End();


                    return File("test.csv", "text/csv");

                }
                catch (Exception ex) { Debug.Print(ex.Message); return Json(new { errormsg = ex.Message }, JsonRequestBehavior.AllowGet); }
            }
            catch (Exception exc) { Debug.Print(exc.Message); return Json(new { errormsg = exc.Message }); }
        }

        [HttpGet]
        [ActionName("SPEKSummaryCSvReport")]
        public ActionResult SPEKSummaryCSvReport() {
            try
            {
                StringBuilder sb = new StringBuilder();

                try
                {
                    sb.Append("No" + "," + "Company" + "," + "BranchName" + "," + "RouteFrom" + "," + "RouteTo" + "," + "Milage" + "," + "Frequency" + "," + "RevenueAccrued" + "," + "BranchApproving_Officer" + "," + "HO_Authorizing_Officer");
                    sb.Append("\r\n");

                    var k = 2;

                    foreach (var item in SpecieAnalytics.specieResults)
                    {
                        sb.Append((k-1).ToString() + "," + item.branchId + "," + item.branchName + "," + item.routeFrom + "," + item.routeTo + "," + item.Milage + "," + item.Frequency + "," + item.RevenueAccrued + "," + item.BranchApprover + "," + item.HOAuthorizer);
                        sb.Append("\r\n");

                        k += 1;
                    }

                    Response.Clear();
                    Response.ContentType = "text/csv";
                    Response.AddHeader("content-disposition", "attachment;filename=SPEKSummaryReport" + ".csv");
                    Response.Write(sb);
                    Response.End();


                    return File("test.csv", "text/csv");

                }
                catch (Exception ex) { Debug.Print(ex.Message); return Json(new { errormsg = ex.Message }, JsonRequestBehavior.AllowGet); }
            }
            catch (Exception exc) { Debug.Print(exc.Message); return Json(new { errormsg = exc.Message }); }
        }

        [HttpGet]
        public JsonResult getTellerSummary(string Fn) {
            try
            {
                var ttList = new TellerAnalytics { processName = Fn }.getTellerSummaryUsingFile();
                return Json(new { status = true, msg = ttList },JsonRequestBehavior.AllowGet);
            }
            catch 
            {
                return Json(new { status = false, msg = @"Error" },JsonRequestBehavior.AllowGet);
            }
        }

        [HttpGet]
        public JsonResult getSpecieSummary(string Fn) {
            try
            {
                var specieList = new SpecieAnalytics { nameOfFile = Fn }.getSpecieSummary();
                return Json(new { status = true, msg = specieList },JsonRequestBehavior.AllowGet);
            }
            catch 
            {
                return Json(new { status = false, msg = @"Error" },JsonRequestBehavior.AllowGet);
            }
        }

        [HttpGet]
        public JsonResult getCheckPointSummary(string dF, string dT, string statusType, string fileName) {
            try
            {
                String format = "dd/MM/yyyy";
                DateTime _dateFrom = DateTime.ParseExact(dF, format, CultureInfo.InvariantCulture, DateTimeStyles.None);
                DateTime _dateTo = DateTime.ParseExact(dT, format, CultureInfo.InvariantCulture, DateTimeStyles.None);

                List<CheckPointAnalytics> res = new List<CheckPointAnalytics>();

                var cp = new CheckPointAnalytics 
                { 
                    dateFrom = _dateFrom,
                    dateTo = _dateTo,
                    recordStatus = statusType,
                    uploadFileName = fileName
                };

                res = cp.getCheckPointSummaryReport();

                return Json(new { status = true, msg = res },JsonRequestBehavior.AllowGet);

            }
            catch (Exception e) 
            {
                return Json(new { status = false, msg = e.Message },JsonRequestBehavior.AllowGet);
            }
        }

        #region PDFs

        [HttpGet]
        [ActionName("SpecieSummaryDetails")]
        public ActionResult SpecieSummaryDetails()
        {
            try
            {
                var obj = SpecieAnalytics.specieResults;

                LocalReport localreport = new LocalReport();
                localreport.ReportPath = System.Web.HttpContext.Current.Server.MapPath("~/Content/Reports/SpecieSummary.rdlc");
                ReportDataSource reportDataSource = new ReportDataSource("SpecieData", obj);
                localreport.DataSources.Add(reportDataSource);


                string reportType = "PDF";
                string mimeType;
                string encoding;
                string fileNameExtension;

                string deviceInfo =
                "<DeviceInfo>" +
                "  <OutputFormat>PDF</OutputFormat>" +
                "  <PageWidth>10.5in</PageWidth>" +
                "  <PageHeight>11in</PageHeight>" +
                "  <MarginTop>0.5in</MarginTop>" +
                "  <MarginLeft>1in</MarginLeft>" +
                "  <MarginRight>1in</MarginRight>" +
                "  <MarginBottom>0.5in</MarginBottom>" +
                "</DeviceInfo>";

                Warning[] warnings;
                string[] streams;
                byte[] renderedBytes;

                fileNameExtension = "pdf";
                renderedBytes = localreport.Render(
                    reportType,
                    deviceInfo,
                    out mimeType,
                    out encoding,
                    out fileNameExtension,
                    out streams,
                    out warnings);

                //Response.AddHeader("content-disposition", "attachment; filename=LeaveHistory." + fileNameExtension);
                return File(renderedBytes, mimeType);
            }
            catch (Exception e)
            {
                Debug.Print(e.Message);
                return Json(new { errormsg = e.Message }, JsonRequestBehavior.AllowGet);
            }
        }


        [HttpGet]
        [ActionName("TellerSummaryDetails")]
        public ActionResult TellerSummaryDetails()
        {
            try
            {
                var obj = TellerAnalytics.tellerResultant;

                LocalReport localreport = new LocalReport();
                localreport.ReportPath = System.Web.HttpContext.Current.Server.MapPath("~/Content/Reports/TellerSummary.rdlc");
                ReportDataSource reportDataSource = new ReportDataSource("TellerData", obj);
                localreport.DataSources.Add(reportDataSource);


                string reportType = "PDF";
                string mimeType;
                string encoding;
                string fileNameExtension;

                string deviceInfo =
                "<DeviceInfo>" +
                "  <OutputFormat>PDF</OutputFormat>" +
                "  <PageWidth>10.5in</PageWidth>" +
                "  <PageHeight>11in</PageHeight>" +
                "  <MarginTop>0.5in</MarginTop>" +
                "  <MarginLeft>1in</MarginLeft>" +
                "  <MarginRight>1in</MarginRight>" +
                "  <MarginBottom>0.5in</MarginBottom>" +
                "</DeviceInfo>";

                Warning[] warnings;
                string[] streams;
                byte[] renderedBytes;

                fileNameExtension = "pdf";
                renderedBytes = localreport.Render(
                    reportType,
                    deviceInfo,
                    out mimeType,
                    out encoding,
                    out fileNameExtension,
                    out streams,
                    out warnings);

                //Response.AddHeader("content-disposition", "attachment; filename=LeaveHistory." + fileNameExtension);
                return File(renderedBytes, mimeType);
            }
            catch (Exception e)
            {
                Debug.Print(e.Message);
                return Json(new { errormsg = e.Message }, JsonRequestBehavior.AllowGet);
            }
        }


        [HttpGet]
        [ActionName("CollectionPDFReport")]
        public ActionResult CollectionPDFReport()
        {
            try
            {
                var obj = CollectionAnalytics.tColl;

                LocalReport localreport = new LocalReport();
                localreport.ReportPath = System.Web.HttpContext.Current.Server.MapPath("~/Content/Reports/CollectionSummary.rdlc");
                ReportDataSource reportDataSource = new ReportDataSource("CollectionDta", obj);
                localreport.DataSources.Add(reportDataSource);


                string reportType = "PDF";
                string mimeType;
                string encoding;
                string fileNameExtension;

                string deviceInfo =
                "<DeviceInfo>" +
                "  <OutputFormat>PDF</OutputFormat>" +
                "  <PageWidth>10.5in</PageWidth>" +
                "  <PageHeight>11in</PageHeight>" +
                "  <MarginTop>0.5in</MarginTop>" +
                "  <MarginLeft>0.5in</MarginLeft>" +
                "  <MarginRight>0.5in</MarginRight>" +
                "  <MarginBottom>0.5in</MarginBottom>" +
                "</DeviceInfo>";

                Warning[] warnings;
                string[] streams;
                byte[] renderedBytes;

                fileNameExtension = "pdf";
                renderedBytes = localreport.Render(
                    reportType,
                    deviceInfo,
                    out mimeType,
                    out encoding,
                    out fileNameExtension,
                    out streams,
                    out warnings);

                Response.AddHeader("content-disposition", "attachment; filename=CollectionSummary." + fileNameExtension);
                return File(renderedBytes, mimeType);
            }
            catch (Exception e)
            {
                Debug.Print(e.Message);
                return Json(new { errormsg = e.Message }, JsonRequestBehavior.AllowGet);
            }
        }


        [HttpGet]
        [ActionName("DHLSummaryPDFReport")]
        public ActionResult DHLSummaryPDFReport()
        {
            try
            {
                var obj = CourierAnalytics.tData;

                LocalReport localreport = new LocalReport();
                localreport.ReportPath = System.Web.HttpContext.Current.Server.MapPath("~/Content/Reports/FedexSummaryReport.rdlc");
                ReportDataSource reportDataSource = new ReportDataSource("FedexDta", obj);
                localreport.DataSources.Add(reportDataSource);


                string reportType = "PDF";
                string mimeType;
                string encoding;
                string fileNameExtension;

                string deviceInfo =
                "<DeviceInfo>" +
                "  <OutputFormat>PDF</OutputFormat>" +
                "  <PageWidth>10.5in</PageWidth>" +
                "  <PageHeight>11in</PageHeight>" +
                "  <MarginTop>0.5in</MarginTop>" +
                "  <MarginLeft>0.5in</MarginLeft>" +
                "  <MarginRight>0.5in</MarginRight>" +
                "  <MarginBottom>0.5in</MarginBottom>" +
                "</DeviceInfo>";

                Warning[] warnings;
                string[] streams;
                byte[] renderedBytes;

                fileNameExtension = "pdf";
                renderedBytes = localreport.Render(
                    reportType,
                    deviceInfo,
                    out mimeType,
                    out encoding,
                    out fileNameExtension,
                    out streams,
                    out warnings);

                //Response.AddHeader("content-disposition", "attachment; filename=CollectionSummary." + fileNameExtension);
                return File(renderedBytes, mimeType);
            }
            catch (Exception e)
            {
                Debug.Print(e.Message);
                return Json(new { errormsg = e.Message }, JsonRequestBehavior.AllowGet);
            }
        }


        [HttpGet]
        [ActionName("DHLDataSummaryPDFReport")]
        public ActionResult DHLDataSummaryPDFReport()
        {
            try
            {
                var obj = CourierAnalytics.tDHLDTA;

                LocalReport localreport = new LocalReport();
                localreport.ReportPath = System.Web.HttpContext.Current.Server.MapPath("~/Content/Reports/DHLSummaryReport.rdlc");
                ReportDataSource reportDataSource = new ReportDataSource("DHLTDta", obj);
                localreport.DataSources.Add(reportDataSource);


                string reportType = "PDF";
                string mimeType;
                string encoding;
                string fileNameExtension;

                string deviceInfo =
                "<DeviceInfo>" +
                "  <OutputFormat>PDF</OutputFormat>" +
                "  <PageWidth>10.5in</PageWidth>" +
                "  <PageHeight>11in</PageHeight>" +
                "  <MarginTop>0.5in</MarginTop>" +
                "  <MarginLeft>0.5in</MarginLeft>" +
                "  <MarginRight>0.5in</MarginRight>" +
                "  <MarginBottom>0.5in</MarginBottom>" +
                "</DeviceInfo>";

                Warning[] warnings;
                string[] streams;
                byte[] renderedBytes;

                fileNameExtension = "pdf";
                renderedBytes = localreport.Render(
                    reportType,
                    deviceInfo,
                    out mimeType,
                    out encoding,
                    out fileNameExtension,
                    out streams,
                    out warnings);

                //Response.AddHeader("content-disposition", "attachment; filename=CollectionSummary." + fileNameExtension);
                return File(renderedBytes, mimeType);
            }
            catch (Exception e)
            {
                Debug.Print(e.Message);
                return Json(new { errormsg = e.Message }, JsonRequestBehavior.AllowGet);
            }
        }

        [HttpGet]
        [ActionName("CHECKPointPDFReport")]
        public ActionResult CHECKPointPDFReport()
        {
            try
            {
                var obj = CheckPointAnalytics.chkData;

                LocalReport localreport = new LocalReport();
                localreport.ReportPath = System.Web.HttpContext.Current.Server.MapPath("~/Content/Reports/CheckPointSummaryReport.rdlc");
                ReportDataSource reportDataSource = new ReportDataSource("CHKDta", obj);
                localreport.DataSources.Add(reportDataSource);

                string reportType = "PDF";
                string mimeType;
                string encoding;
                string fileNameExtension;

                string deviceInfo =
                "<DeviceInfo>" +
                "  <OutputFormat>PDF</OutputFormat>" +
                "  <PageWidth>10.5in</PageWidth>" +
                "  <PageHeight>11in</PageHeight>" +
                "  <MarginTop>0.5in</MarginTop>" +
                "  <MarginLeft>0.5in</MarginLeft>" +
                "  <MarginRight>0.5in</MarginRight>" +
                "  <MarginBottom>0.5in</MarginBottom>" +
                "</DeviceInfo>";

                Warning[] warnings;
                string[] streams;
                byte[] renderedBytes;

                fileNameExtension = "pdf";
                renderedBytes = localreport.Render(
                    reportType,
                    deviceInfo,
                    out mimeType,
                    out encoding,
                    out fileNameExtension,
                    out streams,
                    out warnings);

                //Response.AddHeader("content-disposition", "attachment; filename=CollectionSummary." + fileNameExtension);
                return File(renderedBytes, mimeType);
            }
            catch (Exception e) 
            {
                Debug.Print(e.Message);
                return Json(new { errormsg = e.Message },JsonRequestBehavior.AllowGet);
            }
        }

        #endregion

    }
}
