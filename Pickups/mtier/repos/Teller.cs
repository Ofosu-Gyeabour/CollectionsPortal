using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

using System.Diagnostics;

using Pickups.bridge;
using Pickups.mtier.xlCRUD;
using Pickups.mtier.businessObjects;
using Pickups.mtier.repos;
using System.Data;
using System.Data.Common;
using System.Data.SqlClient;

namespace Pickups.mtier.repos
{
    public class Teller
    {
        #region Properties

        public int tellerId { get; set; }
        public Company objCompany { get; set; }
        public string location { get; set; }
        public int tellerNumbers { get; set; }
        public string tellerNames { get; set; }
        public decimal tRate { get; set; }
        public decimal amount { get; set; }

        public string branchInput { get; set; }
        public string headOfficeInput { get; set; }

        public int HoUser { get; set; }     //head office inputter
        public int BrUser { get; set; }   //branch inputter

        public Process objProcess { get; set; }

        #endregion


        #region APIs

        public int getId() {
            using (var c = Connectors.getConnection()) {
                try
                {
                    var cd = new SqlCommand(@"select Id from dbo.Teller where branchId = @bId and tnames = @tnames;", c);
                    cd.Parameters.AddWithValue("@bId", objCompany.Id);
                    cd.Parameters.AddWithValue("@tnames", this.tellerNames);

                    tellerId = int.Parse(cd.ExecuteScalar().ToString());

                    return (tellerId);
                }
                catch (Exception e) {
                    Debug.Print(e.Message);
                    return (tellerId = 0);
                }
            }
        }

        public List<Teller> get() {
            List<Teller> rs = null;
            using (var c = Connectors.getConnection()) {
                try
                {
                    var cd = new SqlCommand(@"select * from dbo.Teller;", c);

                    using (var d = cd.ExecuteReader()) {
                        if (d.HasRows)
                        {
                            rs = new List<Teller>();
                            while (d.Read()) {
                                var t = new Teller { };

                                t.tellerId = int.Parse(d["Id"].ToString());
                                t.objCompany = new Company { Id = int.Parse(d["branch_Id"].ToString()) }.getCompany();
                                t.location = d["locatn"].ToString().Trim();
                                t.tellerNumbers = int.Parse(d["tnum"].ToString());
                                t.tellerNames = d["tnames"].ToString().Trim();
                                t.tRate = Convert.ToDecimal(d["rate"].ToString());
                                t.amount = Convert.ToDecimal(d["amt"].ToString());

                                rs.Add(t);
                            }
                        }
                        else { return (rs); }

                        return (rs.ToList<Teller>());
                    }
                }
                catch (Exception e) {
                    Debug.Print(e.Message);
                    return (rs);
                }
            }
        }

        public List<Teller> get(string TELLER_CAPTION) {
            List<Teller> rs = null;
            const string defaultValue = "(null)";

            using (var c = Connectors.getConnection()) {
                try
                {
                    var cd = new SqlCommand(@"select * from dbo.Teller where process = @pName;", c);
                    cd.Parameters.AddWithValue("@pName", TELLER_CAPTION);

                    using (var d = cd.ExecuteReader()) {
                        if (d.HasRows)
                        {
                            rs = new List<Teller>();

                            while (d.Read()) {
                                var t = new Teller { };

                                t.tellerId = int.Parse(d["Id"].ToString());
                                t.location = d["locatn"].ToString().Trim();
                                t.objCompany = new Company { Id = int.Parse(d["branch_Id"].ToString()) }.getCompany();
                                t.tellerNumbers = int.Parse(d["tnum"].ToString());
                                t.tellerNames = d["tnames"].ToString().Trim();
                                t.tRate = Convert.ToDecimal(d["rate"].ToString());
                                t.amount = Convert.ToDecimal(d["amt"].ToString());
                                t.objProcess = new Process { 
                                    processName = d["process"].ToString().Trim()
                                };

                                t.branchInput = string.Format("{0}", d["branchInput"].ToString() ?? defaultValue);
                                t.BrUser = int.Parse(d["branchOfficerId"].ToString());
                                //t.HoUser = int.Parse(d["HOfficerId"].ToString());

                                rs.Add(t);
                            }

                            return (rs.ToList<Teller>());
                        }
                        else { return (rs); }
                    }
                }
                catch (Exception e) {
                    Debug.Print(e.Message);
                    return (rs);
                }
            }
        }

        public Teller getTeller() { 
            //get a teller record using the Id
            Teller tt = null;
            using (var c = Connectors.getConnection()) {
                try
                {
                    var cd = new SqlCommand(@"select * from dbo.Teller where Id = @tId;", c);
                    cd.Parameters.AddWithValue("@tId", this.tellerId);

                    using (var d = cd.ExecuteReader()) {
                        if (d.HasRows)
                        {
                            tt = new Teller();
                            d.Read();

                            tt.tellerId = this.tellerId;
                            tt.objCompany = new Company { Id = int.Parse(d["branch_Id"].ToString()) }.getCompany();
                            tt.tellerNumbers = int.Parse(d["tnum"].ToString());
                            tt.tellerNames = d["tnames"].ToString().Trim();
                            tt.tRate = Convert.ToDecimal(d["rate"].ToString());
                            tt.amount = Convert.ToDecimal(d["amt"].ToString());
                        }
                        else { return (tt); }

                        return (tt);
                    }
                }
                catch (Exception trec) {
                    Debug.Print(trec.Message);
                    return (tt);
                }
            }
        }

        public bool Load() {
            using (var c = Connectors.getConnection()) {
                try
                {
                    var cd = new SqlCommand { 
                        Connection = c,
                        CommandType = CommandType.StoredProcedure,
                        CommandText = @"[proc_teller_i]",
                        CommandTimeout = 20
                    };

                    cd.Parameters.AddWithValue("@bId", this.objCompany.getCompanyUsingCode().Id);
                    cd.Parameters.AddWithValue("@loc", this.location);
                    cd.Parameters.AddWithValue("@tno", this.tellerNumbers);
                    cd.Parameters.AddWithValue("@tnames", this.tellerNames);
                    cd.Parameters.AddWithValue("@rate", this.tRate);
                    cd.Parameters.AddWithValue("@amt", this.amount);
                    cd.Parameters.AddWithValue("@loaded", 1);
                    cd.Parameters.AddWithValue("@process", this.objProcess.processName);
                    cd.Parameters.AddWithValue("@status", 1);
                    cd.Parameters.AddWithValue("@brInput", string.Empty);
                    cd.Parameters.AddWithValue("@bOfficerId", 0);
                    cd.Parameters.AddWithValue("@HoInput", string.Empty);
                    cd.Parameters.AddWithValue("@HOfficerId", 0);

                    this.tellerId = int.Parse(cd.ExecuteScalar().ToString());

                    return (this.tellerId > 0 ? true : false);
                }
                catch (Exception e) {
                    Debug.Print(e.Message);
                    return false;
                }
            }
        }

        public bool isLoaded(string fn) {
            using (var c = Connectors.getConnection())
            {
                try
                {
                    var cd = new SqlCommand(@"select count(*) from dbo.Teller where process = @p and isLoaded = @isL;", c);
                    cd.Parameters.AddWithValue("@p", fn);
                    cd.Parameters.AddWithValue("@isL", 0);

                    var cnt = int.Parse(cd.ExecuteScalar().ToString());

                    return (cnt > 0 ? false : true);
                }
                catch (Exception e)
                {
                    Debug.Print(e.Message);
                    return false;
                }
            }
        }

        public bool PersistTellerData(string fn) {
            using (var c = Connectors.getConnection()) {
                try
                {
                    var cd = new SqlCommand(@"update dbo.Teller set isLoaded = @isLoaded where process = @process;", c);
                    cd.Parameters.AddWithValue("@isLoaded", 1);
                    cd.Parameters.AddWithValue("@process", fn);

                    cd.ExecuteNonQuery();
                    return true;
                }
                catch (Exception e) {
                    Debug.Print(e.Message);
                    return false;
                }
            }
        }

        public bool DeleteFile(string fn) {
            using (var c = Connectors.getConnection()) {
                try
                {
                    using (var trans = c.BeginTransaction()) {
                        try
                        {
                            var cd = new SqlCommand(@"delete from dbo.Teller where process = @process and isLoaded = @isLoadStatus;", c, trans);
                            cd.Parameters.AddWithValue("@process", fn);
                            cd.Parameters.AddWithValue("@isLoadStatus", 0);

                            cd.ExecuteNonQuery();

                            var cmd = new SqlCommand(@"delete from dbo.processLookup where procName = @procName;", c, trans);
                            cmd.Parameters.AddWithValue("@procName", fn);
                            cmd.ExecuteNonQuery();

                            trans.Commit();
                            return true;
                        }
                        catch (Exception terr) {
                            trans.Rollback();
                            return false;
                        }
                    }
                }
                catch (Exception e) {
                    Debug.Print(e.Message);
                    
                    return false;
                }
            }
        }

        public List<Teller> getDistinctTellerFiles() {
            List<Teller> result = null;
            using (var c = Connectors.getConnection()) {
                try
                {
                    var cd = new SqlCommand(@"select distinct process from dbo.Teller where isLoaded = @isLoadStatus;", c);
                    cd.Parameters.AddWithValue("@isLoadStatus", 1);

                    using (var d = cd.ExecuteReader()) {
                        if (d.HasRows)
                        {
                            result = new List<Teller>();
                            var i = 1;
                            while (d.Read()) {
                                var t = new Teller { tellerId = i };
                                //t.objProcess = new Process { processName = d["process"].ToString(), processType = @"TELLR" };
                                t.location = d["process"].ToString();

                                result.Add(t);
                                i++;
                            }
                        }
                        else { return (result); }

                        return (result.ToList<Teller>());
                    }
                }
                catch (Exception e) {
                    Debug.Print(e.Message);
                    return (result);
                }
            }
        }

        public List<Teller> getDistinctTellerFiles(int LOADCATEGORYSTATUS, int STATUSCATEGORY) {
            List<Teller> result = null;
            using (var c = Connectors.getConnection()) {
                try
                {
                    var cd = new SqlCommand(@"select distinct process from dbo.Teller where isLoaded = @isLoadStatus and [status] = @isStatus", c);
                    cd.Parameters.AddWithValue("@isLoadStatus", LOADCATEGORYSTATUS);
                    cd.Parameters.AddWithValue("@isStatus", STATUSCATEGORY);

                    using (var d = cd.ExecuteReader()) {
                        if (d.HasRows)
                        {
                            result = new List<Teller>();
                            var i = 1;

                            while (d.Read()) {
                                var t = new Teller { tellerId = i };
                                t.location = d["process"].ToString();

                                result.Add(t);
                                i++;
                            }
                        }
                        else { return (result); }

                        return (result.ToList<Teller>());
                    }
                }
                catch (Exception e) {
                    Debug.Print(e.Message);
                    return (result);
                }
            }
        }

        public bool getAuthorizingStatus(int _id)
        {
            //determines if a particular record has been authorized or otherwise
            using (var c = Connectors.getConnection())
            {
                try
                {
                    var cd = new SqlCommand(@"select [status] from dbo.Teller where Id = @id;", c);
                    cd.Parameters.AddWithValue("@id", _id);

                    var statId = int.Parse(cd.ExecuteScalar().ToString());
                    return (statId == 3 ? false : true);
                }
                catch (Exception e)
                {
                    Debug.Print(e.Message);
                    return false;
                }
            }
        }

        public bool getApprovingStatus(int _id)
        {
            //determines if a particular record has been authorized or otherwise
            using (var c = Connectors.getConnection())
            {
                try
                {
                    var cd = new SqlCommand(@"select [status] from dbo.Teller where Id = @id;", c);
                    cd.Parameters.AddWithValue("@id", _id);

                    var statId = int.Parse(cd.ExecuteScalar().ToString());
                    return (statId == 2 ? false : true);
                }
                catch (Exception e)
                {
                    Debug.Print(e.Message);
                    return false;
                }
            }
        }

        public bool AuthorizeTellerData(int _Id, string _value, int official_Id)
        {
            //method is used to approve head office specie data
            try
            {
                using (var c = Connectors.getConnection())
                {
                    try
                    {
                        var cd = new SqlCommand(@"update dbo.Teller set HOInput = @hInput, status = @status, HOfficerId = @officerId where Id = @id;", c);
                        cd.Parameters.AddWithValue("@hInput", _value);
                        cd.Parameters.AddWithValue("@status", 3);  //SPECIE MOVEMENT approval by H/Office
                        cd.Parameters.AddWithValue("@officerId", official_Id); //H/O approving officer Id
                        cd.Parameters.AddWithValue("@id", _Id);

                        cd.ExecuteNonQuery();
                    }
                    catch (Exception de)
                    {
                        Debug.Print(de.Message);
                    }
                }

                return true;
            }
            catch (Exception e)
            {
                Debug.Print(e.Message);
                return false;
            }
        }

        public bool ApproveTellerData(int _Id, string _value, int official_Id)
        {
            //method is used to approve branch pickup or collection data
            try
            {
                using (var c = Connectors.getConnection())
                {
                    try
                    {
                        var cd = new SqlCommand(@"update dbo.Teller set branchInput = @bInput, status = @status, branchOfficerId = @officerId where Id = @id;", c);
                        cd.Parameters.AddWithValue("@bInput", _value);
                        cd.Parameters.AddWithValue("@status", 2);  //Branch Approval
                        cd.Parameters.AddWithValue("@officerId", official_Id); //approving officer Id
                        cd.Parameters.AddWithValue("@id", _Id);

                        cd.ExecuteNonQuery();
                    }
                    catch (Exception de)
                    {
                        Debug.Print(de.Message);
                    }
                }

                return true;
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