using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

using Pickups.mtier.businessObjects;
using Pickups.bridge;

using System.DirectoryServices.AccountManagement;
using System.DirectoryServices.Protocols;

using System.Net;
using System.Diagnostics;

namespace Pickups.Controllers
{
    public class UserController : Controller
    {
        
        public ActionResult IDChallenge()
        {
            return View();
        }

        public JsonResult Login(string usrname, string pwd) { 
            //get user details from the data store
            try
            {
                var usrn = usrname.Replace(@"@nib-ghana.com", string.Empty);
                var u = new Usr { username = usrn }.get(pwd);
                if (u != null)
                {
                    if (u.usingAD != 1)
                    {
                        var hash = Hashing.CreateHash(pwd);
                        if (hash == u.password)
                        {
                            if (u.isActive == 1)
                            {
                                u.isLogged = 1;
                                Session["username"] = usrn;
                                Session["password"] = hash;
                                Session["timeLoggedIn"] = DateTime.Now.TimeOfDay.ToString();
                                Session["dateLoggedIn"] = DateTime.Now.Date.ToString();
                                Session["userId"] = u.Id;
                                Session["profile"] = u.profile;
                                Session["department"] = u.objCompany.Id;

                                Session["official_Id"] = u.objOfficial.Id;

                                new Usr { }.ChangeLogStatus(u);
                                return Json(new { status = true, msg = "validation successful...logging in...", uprofile = u.profile }, JsonRequestBehavior.AllowGet);
                            }
                            else { return Json(new { status = false, msg = "User account is de-activated" }, JsonRequestBehavior.AllowGet); }
                        }
                        else { return Json(new { status = false, msg = "Incorrect login credentials" }, JsonRequestBehavior.AllowGet); }
                    }
                    else
                    {
                        //user is using active directory authentication
                        try
                        {
                            using (PrincipalContext pc = new PrincipalContext(ContextType.Domain, "nib-ghana.com"))
                            {
                                // validate the credentials
                                bool isValid = pc.ValidateCredentials(usrn, pwd);

                                if (isValid)
                                {
                                    Session["username"] = usrn;
                                    Session["password"] = pwd;
                                    Session["timeLoggedIn"] = DateTime.Now.TimeOfDay.ToString();
                                    Session["dateLoggedIn"] = DateTime.Now.Date.ToString();
                                    Session["userId"] = u.Id;
                                    Session["profile"] = u.profile;
                                    Session["department"] = u.objCompany.Id;

                                    Session["official_Id"] = u.objOfficial.Id;

                                    new Usr { }.ChangeLogStatus(u);
                                    return Json(new { status = true, msg = "validation successful...logging in...", uprofile = u.profile }, JsonRequestBehavior.AllowGet);
                                }
                                else 
                                {
                                    return Json(new { status = false, msg = "Incorrect User credentials" },JsonRequestBehavior.AllowGet);
                                }
                            }
                        }
                        catch (LdapException xx)
                        {
                            Debug.Print(string.Format("Msg:{0}\r\nSource:{1}", xx.Message, xx.Source));
                            return Json(new { status = false, msg = xx.Message }, JsonRequestBehavior.AllowGet);
                        }
                    }
                }
                else { return Json(new { status = false, msg = string.Format("User {0} does not exist",u.username) },JsonRequestBehavior.AllowGet); }
            }
            catch (Exception e) {
                Debug.Print(e.Message);
                return Json(new { status = false, msg = e.Message },JsonRequestBehavior.AllowGet);
            }
        }

        public ActionResult LogOut()
        {
            //method is used for logging out users from the database
            try
            {
                var obj = new Usr { 
                    username = Session["username"].ToString(),
                    isLogged = 0,
                    Id = int.Parse(Session["userId"].ToString())
                };

                new Usr { }.ChangeLogStatus(obj);

                return RedirectToAction("IDChallenge", "User");
            }
            catch (Exception e)
            {
                return RedirectToAction("BranchVerification", "Home");
            }
        }

    }
}
