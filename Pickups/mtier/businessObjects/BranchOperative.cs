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
using Pickups.mtier.businessObjects;
using Pickups.mtier.repos;

namespace Pickups.mtier.businessObjects
{
    public class BranchOperative
    {
        #region Properties

        public int Id { get; set; }

        public string staffNumber { get; set; }
        public string surname { get; set; }
        public string firstName { get; set; }
        public string otherNames { get; set; }
        public Company objCompany { get; set; }
        public string emailAddress { get; set; }
        public string mobile { get; set; }
        public string capacity { get; set; }

        #endregion

        #region Methods

        public bool add() {
            using (var con = Connectors.getConnection()) {
                try
                {
                    var cd = new SqlCommand { 
                        Connection = con,
                        CommandType = CommandType.StoredProcedure,
                        CommandText = @"[proc_nibOfficial_i]",
                        CommandTimeout = 20
                    };

                    cd.Parameters.AddWithValue("@sNo", this.staffNumber);
                    cd.Parameters.AddWithValue("@sn", this.surname);
                    cd.Parameters.AddWithValue("@others", this.otherNames);
                    cd.Parameters.AddWithValue("@comp_Id", this.objCompany.Id);
                    cd.Parameters.AddWithValue("@capacity", this.capacity);
                    cd.Parameters.AddWithValue("@emailaddress", this.emailAddress);
                    cd.Parameters.AddWithValue("@mobile", this.mobile);

                    cd.ExecuteNonQuery();
                    return true;
                }
                catch (Exception e) {
                    Debug.Print(e.Message);
                    return false;
                }
            }
        }

        public List<BranchOperative> get() {
            List<BranchOperative> result = null;
            using (var c = Connectors.getConnection()) {
                try
                {
                    var cd = new SqlCommand { 
                        Connection = c,
                        CommandType = CommandType.Text,
                        CommandText = @"select * from dbo.NIBOfficial;",
                        CommandTimeout = 20
                    };

                    var i = 1;
                    using (var d = cd.ExecuteReader()) {
                        if (d.HasRows) { result = new List<BranchOperative>(); } else { return result; }
                        while (d.Read()) {
                            var o = new BranchOperative 
                            { 
                                Id = i,
                                staffNumber = d["staffNo"].ToString().Trim(),
                                surname = string.Format("{0}, {1}", d["surname"].ToString().Trim(),d["othernames"].ToString()),
                                otherNames = d["othernames"].ToString().Trim(),
                                objCompany = new Company{ Id = int.Parse(d["company_Id"].ToString())}.getCompany(),
                                capacity = d["capacity"].ToString().Trim(),
                                emailAddress = d["emailaddress"].ToString().Trim(),
                                mobile = d["mobile"].ToString().Trim()
                            };

                            result.Add(o);
                            i++;
                        }

                        return (result.ToList<BranchOperative>());
                    }
                }
                catch (Exception e) {
                    Debug.Print(e.Message);
                    return (result);
                }
            }
        }

        public List<BranchOperative> getOperativeUsingCompany() {
            List<BranchOperative> result = null;
            using (var c = Connectors.getConnection())
            {
                try
                {
                    var cd = new SqlCommand
                    {
                        Connection = c,
                        CommandType = CommandType.Text,
                        CommandText = @"select * from dbo.NIBOfficial where company_Id = @comp_Id;",
                        CommandTimeout = 20
                    };

                    cd.Parameters.AddWithValue("@comp_Id", this.objCompany.Id);

                    var i = 1;
                    using (var d = cd.ExecuteReader())
                    {
                        if (d.HasRows) { result = new List<BranchOperative>(); } else { return result; }
                        while (d.Read())
                        {
                            var o = new BranchOperative
                            {
                                Id = i,
                                staffNumber = d["staffNo"].ToString().Trim(),
                                surname = string.Format("{0}, {1}", d["surname"].ToString().Trim(), d["othernames"].ToString()),
                                otherNames = d["othernames"].ToString().Trim(),
                                objCompany = new Company { Id = int.Parse(d["company_Id"].ToString()) }.getCompany(),
                                capacity = d["capacity"].ToString().Trim(),
                                emailAddress = d["emailaddress"].ToString().Trim(),
                                mobile = d["mobile"].ToString().Trim()
                            };

                            result.Add(o);
                            i++;
                        }

                        return (result.ToList<BranchOperative>());
                    }
                }
                catch (Exception e)
                {
                    Debug.Print(e.Message);
                    return (result);
                }
            }
        }

        public BranchOperative getOperative() { 
            //method is responsible for getting the operative
            BranchOperative o = null;
            using (var c = Connectors.getConnection()) {
                try
                {
                    var cd = new SqlCommand(@"select * from dbo.NIBOfficial where Id = @id;", c);
                    cd.Parameters.AddWithValue("@id", this.Id);

                    using (var d = cd.ExecuteReader()) {
                        if (d.HasRows)
                        {
                            d.Read();
                            o = new BranchOperative();

                            o.Id = this.Id;
                            o.staffNumber = d["staffNo"].ToString().Trim();
                            o.surname = d["surname"].ToString().Trim();
                            o.otherNames = d["othernames"].ToString().Trim();
                            o.objCompany = new Company { Id = int.Parse(d["company_Id"].ToString()) }.getCompany();
                            o.capacity = d["capacity"].ToString().Trim();
                            o.emailAddress = d["emailaddress"].ToString().Trim();
                            o.mobile = d["mobile"].ToString().Trim();
                        }
                        else { return o; }

                        return (o);
                    }
                }
                catch (Exception e) {
                    Debug.Print(e.Message);
                    return (o);
                }
            }
        }

        public int getIdUsingStaffNumber() { 
            //method is used to get the Id of a staff by using the staff number
            using (var c = Connectors.getConnection()) {
                try
                {
                    var cd = new SqlCommand(@"select Id from dbo.NIBOfficial where staffNo = @stNo;", c);
                    cd.Parameters.AddWithValue("@stNo", this.staffNumber);

                    this.Id = int.Parse(cd.ExecuteScalar().ToString());
                    return (this.Id);
                }
                catch (Exception e) {
                    Debug.Print(e.Message);
                    return (this.Id = 0);
                }
            }
        }

        #endregion


    }
}