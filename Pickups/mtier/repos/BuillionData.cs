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

namespace Pickups.mtier.repos
{
    public class BuillionData
    {
        #region Properties
        public int Id { get; set; }

        public Company objCompany { get; set; }
        public Routes objRoute { get; set; }
        public Process objProcess { get; set; }
        public Pickups.mtier.xlCRUD.Pickups objPickup { get; set; }

        public Pickups.mtier.xlCRUD.CashColl objCashCollection { get; set; }

        public static List<BuillionData> resultant { get; set; }

        #endregion

        #region Method APIs

        public bool Load(string fn) {
            using (var c = Connectors.getConnection()) {
                try
                {
                    var cd = new SqlCommand { 
                        Connection = c,
                        CommandType = CommandType.StoredProcedure,
                        CommandText = @"[proc_cashcoll_i]",
                        CommandTimeout = 20
                    };

                    cd.Parameters.AddWithValue("@company", objCompany.getCompanyUsingCode().Id);
                    cd.Parameters.AddWithValue("@cname", objCashCollection.customerName);
                    cd.Parameters.AddWithValue("@clocation", objCashCollection.customerLocation);
                    cd.Parameters.AddWithValue("@fPicks", objCashCollection.pickFrequency);
                    cd.Parameters.AddWithValue("@isWeekDay", objCashCollection.isWeekDay);
                    cd.Parameters.AddWithValue("@rate",objCashCollection.rate);
                    cd.Parameters.AddWithValue("@amt",objCashCollection.amt);
                    cd.Parameters.AddWithValue("@total", objCashCollection.total);
                    cd.Parameters.AddWithValue("@isLoaded", 0);  //change this to 0 later when the approval module for the branch is built
                    cd.Parameters.AddWithValue("@process", objProcess.processName);
                    cd.Parameters.AddWithValue("@status", 0);

                    cd.ExecuteNonQuery();
                    return true;

                }
                catch (Exception e) {
                    Debug.Print(e.Message);
                    return false;
                }
            }
        }
        public bool Load() { 
            //method loads the data into the temporary data store
            using (var con = Connectors.getConnection()) {
                try
                {
                    var cd = new SqlCommand { 
                        Connection = con,
                        CommandType = CommandType.StoredProcedure,
                        CommandText = @"[proc_pickup_i]",
                        CommandTimeout = 20
                    };

                    cd.Parameters.AddWithValue("@dte", objPickup.Date);
                    cd.Parameters.AddWithValue("@bId", objCompany.getIdUsingBranchCode());
                    cd.Parameters.AddWithValue("@vNo", objPickup.vehicleRegistration);
                    cd.Parameters.AddWithValue("@driver", objPickup.NameOfDriver);
                    cd.Parameters.AddWithValue("@rId", objRoute.getRouteUsingRouteID().routeId);
                    cd.Parameters.AddWithValue("@tstart", objPickup.tripStartTime);
                    cd.Parameters.AddWithValue("@tend", objPickup.tripEndTime);
                    cd.Parameters.AddWithValue("@amtDelivered", objPickup.amountDelivered);
                    cd.Parameters.AddWithValue("@repatriation", objPickup.amountRepatriated);
                    cd.Parameters.AddWithValue("@NIBOfficer", objPickup.NIBOfficer);
                    cd.Parameters.AddWithValue("@totMilage", objPickup.totalMilage);
                    cd.Parameters.AddWithValue("@kmEquiv", objPickup.KmEquivalent);
                    cd.Parameters.AddWithValue("@isLoaded", 0);
                    cd.Parameters.AddWithValue("@process", objProcess.processName);

                    cd.ExecuteNonQuery();

                    return true;
                }
                catch (Exception loadErr) {
                    Debug.Print(loadErr.Message);
                    return false;
                }
            }
        }

        public bool isLoaded(string fn) { 
            //method determines if data has already been loaded
            using (var c = Connectors.getConnection()) {
                try
                {
                    var cd = new SqlCommand(@"select count(*) from dbo.CollTemp where process = @p and isLoaded = @isL;", c);
                    cd.Parameters.AddWithValue("@p", fn);
                    cd.Parameters.AddWithValue("@isL", 0);

                    var cnt = int.Parse(cd.ExecuteScalar().ToString());

                    return (cnt > 0 ? false : true);
                }
                catch (Exception e) {
                    Debug.Print(e.Message);
                    return false;
                }
            }
        }

        public bool PersistPickupData(string fn) { 
            //saves the pickup data into the data store...permanently
            using (var con = Connectors.getConnection()) {
                using (var trans = con.BeginTransaction()) {
                    try
                    {
                        var cd = new SqlCommand { 
                            Connection = con,
                            CommandType = CommandType.StoredProcedure,
                            CommandText = @"[proc_cashcoll_p]",
                            CommandTimeout = 15,
                            Transaction = trans
                        };

                        cd.Parameters.AddWithValue("@fn", fn);
                        cd.ExecuteNonQuery();

                        var cmd = new SqlCommand(@"update dbo.CollTemp set isLoaded = @loaded where process = @fn;", con, trans);
                        cmd.Parameters.AddWithValue("@loaded", 2);  //change back to one when the branch approval module for collections have been implemented
                        cmd.Parameters.AddWithValue("@fn", fn);

                        cmd.ExecuteNonQuery();

                        trans.Commit();

                        return true;
                    }
                    catch (Exception e) {
                        Debug.Print(e.Message);
                        trans.Rollback();
                        return false;
                    }
                }
            }
        }

        public bool DeleteFile(string fn) {
            using (var c = Connectors.getConnection()) {
                using (var trans = c.BeginTransaction()) {
                    try
                    {
                        var cd = new SqlCommand(@"delete from dbo.[Collection] where process = @process;", c, trans);
                        cd.Parameters.AddWithValue("@process", fn);
                        cd.ExecuteNonQuery();

                        var com = new SqlCommand(@"delete from dbo.CollTemp where process = @process;", c, trans);
                        com.Parameters.AddWithValue("@process", fn);
                        com.ExecuteNonQuery();

                        var cm = new SqlCommand(@"delete from dbo.ProcessLookup where procName = @procName;", c, trans);
                        cm.Parameters.AddWithValue("@procName", fn);
                        cm.ExecuteNonQuery();

                        trans.Commit();
                        return true;
                    }
                    catch (Exception e) {
                        Debug.Print(e.Message);
                        trans.Rollback();
                        return false;
                    }
                }
            }
        }

        public List<BuillionData> get(string PCK_CAPTION) {
            List<BuillionData> rs = null;
            using (var con = Connectors.getConnection()) {
                try
                {
                    var cd = new SqlCommand(@"select * from dbo.CollTemp where process = @processName order by Id;", con);
                    cd.Parameters.AddWithValue("@processName", PCK_CAPTION);

                    using (var d = cd.ExecuteReader()) {
                        if (d.HasRows) { rs = new List<BuillionData>(); }
                        while (d.Read()) 
                        {
                            var b = new BuillionData { };

                            b.Id = int.Parse(d["Id"].ToString());
                            b.objCompany = new Company { Id = int.Parse(d["branch_Id"].ToString()) }.getCompany();

                            b.objCashCollection = new CashColl { 
                                customerName = d["customerName"].ToString(),
                                customerLocation = d["customerLocatn"].ToString(),
                                pickFrequency = int.Parse(d["freqPicks"].ToString()),
                                rate = Convert.ToDecimal(d["rate"].ToString()),
                                amt = Convert.ToDecimal(d["amt"].ToString()),
                                total = Convert.ToDecimal(d["total"].ToString()),
                            };

                            if (d["isWeekDay"].ToString().Trim() == "1") { b.objCashCollection.isWeekDayExpr = "Yes"; } else { b.objCashCollection.isWeekDayExpr = "No"; }

                            b.objProcess = new Process { processName = PCK_CAPTION };

                            rs.Add(b);
                        }

                        return (rs.ToList<BuillionData>());
                    }
                }
                catch (Exception e) {
                    Debug.Print(e.Message);
                    return (rs);
                }
            }
        }

        #endregion

        #region Branch Verification APIs

        public List<BuillionData> getBranchPickupsUsingDateRange(string df, string dt) { 
            //method is used for getting branch pickups using a date range
            List<BuillionData> rs = null;
            try
            {
                using (var c = Connectors.getConnection()) {
                    try
                    {
                        var cmd = new SqlCommand(@"select * from dbo.BuillionPickup where dte between @d1 and @d2", c);
                        cmd.Parameters.AddWithValue("@d1", df);
                        cmd.Parameters.AddWithValue("@d2", dt);

                        using (var d = cmd.ExecuteReader()) {
                            if (d.HasRows) { 
                                rs = new List<BuillionData>();

                                while (d.Read()) 
                                {
                                    var b = new BuillionData { };

                                    b.Id = int.Parse(d["SNo"].ToString());
                                    b.objCompany = new Company { Id = int.Parse(d["branch_Id"].ToString()) }.getCompany();

                                    b.objCashCollection = new CashColl
                                    {
                                        customerName = d["customerName"].ToString(),
                                        customerLocation = d["customerLocatn"].ToString(),
                                        pickFrequency = int.Parse(d["freqPicks"].ToString()),
                                        rate = Convert.ToDecimal(d["rate"].ToString()),
                                        amt = Convert.ToDecimal(d["amt"].ToString()),
                                        total = Convert.ToDecimal(d["total"].ToString()),
                                    };

                                    if (d["isWeekDay"].ToString().Trim() == "1") { b.objCashCollection.isWeekDayExpr = "Yes"; } else { b.objCashCollection.isWeekDayExpr = "No"; }

                                    b.objProcess = new Process { processName = d["process"].ToString() };

                                    rs.Add(b);
                                }
                            } 
                            else { return rs; }

                            return (rs.ToList<BuillionData>());
                        }
                    }
                    catch (Exception cErr) {
                        Debug.Print(cErr.Message);
                        return (rs);
                    }
                }
            }
            catch (Exception e) {
                Debug.Print(e.Message);
                return (rs);
            }
        }

        public List<BuillionData> getBranchPickupsUsingFileName(string fn) {
            List<BuillionData> result = null;

            using (var c = Connectors.getConnection()) {
                try
                {
                    var cd = new SqlCommand { 
                        Connection = c,
                        CommandType = CommandType.Text,
                        //CommandText = @"select * from dbo.buillionPickup where process = @procFileName;",
                        CommandText = @"select * from dbo.[Collection] where process= @procFileName;",
                        CommandTimeout = 20
                    };

                    cd.Parameters.AddWithValue("@procFileName", fn);

                    using (var d = cd.ExecuteReader()) {
                        if (d.HasRows)
                        {
                            result = new List<BuillionData>();
                            if (resultant != null) { resultant.Clear(); } else { resultant = new List<BuillionData>(); }

                            while (d.Read()) {
                                var b = new BuillionData { };

                                b.Id = int.Parse(d["Id"].ToString());
                                b.objCompany = new Company { Id = int.Parse(d["branch_Id"].ToString()) }.getCompany();

                                b.objCashCollection = new CashColl
                                {
                                    customerName = d["customerName"].ToString(),
                                    customerLocation = d["customerLocatn"].ToString(),
                                    pickFrequency = int.Parse(d["freqPicks"].ToString()),
                                    rate = Convert.ToDecimal(d["rate"].ToString()),
                                    amt = Convert.ToDecimal(d["amt"].ToString()),
                                    total = Convert.ToDecimal(d["total"].ToString()),
                                };

                                b.objCashCollection.btotal = d["branchInput"].ToString();
                                b.objCashCollection.htotal = d["HOInput"].ToString();

                                if (d["isWeekDay"].ToString().Trim() == "1") { b.objCashCollection.isWeekDayExpr = "Yes"; } else { b.objCashCollection.isWeekDayExpr = "No"; }

                                b.objProcess = new Process { processName = fn };

                                result.Add(b);
                            }
                        }
                        else { return result; }

                        resultant = result;
                        return (result.ToList<BuillionData>());
                    }
                }
                catch (Exception e) {
                    Debug.Print(e.Message);
                    return (result);
                }
            }
        }

        public bool getApprovalStatus(int _id) {
            //determines if a particular record has been approved or otherwise
            using (var c = Connectors.getConnection())
            {
                try
                {
                    var cd = new SqlCommand(@"select [status] from dbo.[Collection] where Id = @id;", c);
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

        public bool getAuthorizationStatus(int _id) { 
            //determines if a particular record has been authorized or otherwise
            using (var c = Connectors.getConnection()) {
                try
                {
                    var cd = new SqlCommand(@"select [status] from dbo.[Collection] where Id = @id;", c);
                    cd.Parameters.AddWithValue("@id", _id);

                    var statId = int.Parse(cd.ExecuteScalar().ToString());
                    return (statId == 2 ? false : true); 
                }
                catch (Exception e) {
                    Debug.Print(e.Message);
                    return false;
                }
            }
        }

        public bool ApproveCashCollectionData(int _Id, string _value, int official_Id) {
            //method is used to approve branch pickup or collection data
            try
            {
                using (var c = Connectors.getConnection())
                {
                    try
                    {
                        var cd = new SqlCommand(@"update dbo.[Collection] set HOInput = @hoInput, status = @status, HOfficerId = @officerId where Id = @id;", c);
                        cd.Parameters.AddWithValue("@hoInput", _value);
                        cd.Parameters.AddWithValue("@status", 3);  //H/O approval
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

        public bool AuthorizePickupData(int _Id, string _value,int official_Id) { 
            //method is used to authorize branch pickup data
            try
            {
                using (var c = Connectors.getConnection()) {
                    try
                    {
                        var cd = new SqlCommand(@"update dbo.[Collection] set branchInput = @brInput, status = @status, approvingOfficerId = @officerId where Id = @id;", c);
                        cd.Parameters.AddWithValue("@brInput", _value);
                        cd.Parameters.AddWithValue("@status", 2);  //branch approval
                        cd.Parameters.AddWithValue("@officerId", official_Id); //approving officer Id
                        cd.Parameters.AddWithValue("@id", _Id);

                        cd.ExecuteNonQuery();
                    }
                    catch (Exception de) {
                        Debug.Print(de.Message);
                    }
                }

                return true;
            }
            catch (Exception e) {
                Debug.Print(e.Message);
                return false;
            }
        }

        #endregion

    }
}