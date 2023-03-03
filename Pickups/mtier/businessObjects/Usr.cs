using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

using System.Data;
using System.Data.Common;
using System.Data.SqlClient;
using System.Diagnostics;

using Pickups.bridge;
using Pickups.mtier.xlCRUD;
using Pickups.mtier.repos;

namespace Pickups.mtier.businessObjects
{
    public class Usr
    {
        #region Properties

        public int Id { get; set; }
        public string username { get; set; }
        public string password { get; set; }
        public Company objCompany { get; set; } //branch Id
        public int isActive { get; set; }
        public int isLogged { get; set; }
        public int usingAD { get; set; }
        public int isAdmin { get; set; }
        public string profile { get; set; }
        public BranchOperative objOfficial { get; set; }  //NIB Official

        #endregion

        #region Methods

        public int getId() {
            return 0;
        }

        public List<Usr> get() { 
            //method is used to fetch user data
            List<Usr> result = null;
            using (var c = Connectors.getConnection()) {
                try
                {
                    var cd = new SqlCommand(@"select * from dbo.Usr", c);
                    using (var d = cd.ExecuteReader()) {
                        if (d.HasRows) { result = new List<Usr>(); } else { return (result); }
                        var knt = 1;

                        while (d.Read()) {
                            var u = new Usr { };

                            u.Id = int.Parse(d["Id"].ToString());
                            u.username = d["usrname"].ToString().Trim().ToUpper();
                            u.objCompany = new Company { Id = int.Parse(d["deptId"].ToString()) }.getCompany();
                            u.profile = d["uProfile"].ToString().Trim();
                            u.objOfficial = new BranchOperative { Id = int.Parse(d["official_Id"].ToString()) };

                            result.Add(u);
                            knt++;
                        }

                        return (result.ToList<Usr>());
                    }
                }
                catch (Exception e) {
                    Debug.Print(e.Message);
                    return (result);
                }
            }
        }

        public Usr get(string usrpwd) {
            Usr obj = null;
            using (var c = Connectors.getConnection()) {
                try
                {
                    var cd = new SqlCommand(@"select * from dbo.Usr where usrname = @usr;", c);
                    cd.Parameters.AddWithValue("@usr", this.username);

                    var d = cd.ExecuteReader();
                    if (d.HasRows) { 
                        obj = new Usr();
                        d.Read();

                        //reading the contents of the data reader
                        obj.Id = int.Parse(d["Id"].ToString());
                        obj.username = this.username;
                        obj.password = d["usrpassword"].ToString();
                        obj.objCompany = new Company { Id = int.Parse(d["deptId"].ToString()) }.getCompany();
                        obj.isActive = int.Parse(d["isActive"].ToString());
                        obj.isLogged = int.Parse(d["isLogged"].ToString());
                        obj.usingAD = int.Parse(d["isAD"].ToString());
                        obj.isAdmin = int.Parse(d["isAdmin"].ToString());
                        obj.profile = d["uProfile"].ToString().Trim();

                        obj.objOfficial = new BranchOperative { Id = int.Parse(d["official_Id"].ToString()) }.getOperative();

                    } 
                    else 
                    { return obj; }

                    return (obj);
                }
                catch (Exception e) {
                    Debug.Print(e.Message);
                    return (obj);
                }
            }
        }

        public bool Add() { 
            //method adds a user record to the data store
            using (var c = Connectors.getConnection()) {
                try
                {
                    var cd = new SqlCommand { 
                        Connection = c,
                        CommandType = CommandType.StoredProcedure,
                        CommandText = @"[proc_usr_i]",
                        CommandTimeout = 20
                    };

                    cd.Parameters.AddWithValue("@usr", this.username);
                    cd.Parameters.AddWithValue("@pwd", this.password);
                    cd.Parameters.AddWithValue("@dId", this.objCompany.Id);
                    cd.Parameters.AddWithValue("@active", this.isActive);
                    cd.Parameters.AddWithValue("@logged", this.isLogged);
                    cd.Parameters.AddWithValue("@AD", this.usingAD);
                    cd.Parameters.AddWithValue("@ADM", this.isAdmin);
                    cd.Parameters.AddWithValue("@Profile", this.profile);
                    cd.Parameters.AddWithValue("@offId", this.objOfficial.getIdUsingStaffNumber());

                    this.Id = int.Parse(cd.ExecuteScalar().ToString());

                    return (this.Id > 0 ? true : false);
                }
                catch (Exception e) {
                    Debug.Print(e.Message);
                    return false;
                }
            }
        }

        public bool ChangeLogStatus(Pickups.mtier.businessObjects.Usr u) { 
            //method is responsible for changing the log status of a user
            try
            {
                using (var c = Connectors.getConnection()) {
                    try
                    {
                        var cd = new SqlCommand(@"update dbo.Usr set isLogged = @logStatus where Id = @id and usrname = @usrname;", c);
                        cd.Parameters.AddWithValue("@logStatus", u.isLogged);
                        cd.Parameters.AddWithValue("@id", u.Id);
                        cd.Parameters.AddWithValue("@usrname", u.username);

                        cd.ExecuteNonQuery();
                        return true;
                    }
                    catch 
                    {
                        return false;
                    }
                }
            }
            catch (Exception e) 
            {
                Debug.Print(e.Message);
                return false;
            }
        }

        #endregion

    }
}