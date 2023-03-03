using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

using System.Data;
using System.Data.Common;
using System.Data.SqlClient;
using System.Diagnostics;

using Pickups.bridge;

namespace Pickups.mtier.repos
{
    public class DHL
    {
        #region Properties

        public int Id { get; set; }
        public string AirWayBillNo { get; set; }
        public string Shipper { get; set; }
        public string Receipient { get; set; }
        public decimal WeightInKilograms { get; set; }
        public DateTime AirwayBillDate { get; set; }
        public string AirwayBillDateString { get; set; }
        public decimal Charge { get; set; }
        public decimal Discount { get; set; }
        public decimal SubTotal { get; set; }
        public decimal VAT { get; set; }
        public decimal NationalHealthLevy { get; set; }
        public decimal NetAmount { get; set; }
        public decimal Insurance { get; set; }
        public decimal GrandTotal { get; set; }
        public string Comments { get; set; }

        public Process objProcess { get; set; }
        public Company objCompany { get; set; }

        #endregion


        #region Methods

        public bool Add() {
            try
            {
                using (var c = Connectors.getConnection()) {
                    try
                    {
                        var cd = new SqlCommand { 
                            Connection = c,
                            CommandType = CommandType.StoredProcedure,
                            CommandText = @"proc_DHL_i",
                            CommandTimeout = 20
                        };

                        cd.Parameters.AddWithValue("@wayBillNo", this.AirWayBillNo);
                        cd.Parameters.AddWithValue("@shipper", this.Shipper);
                        cd.Parameters.AddWithValue("@receipient", this.Receipient);
                        cd.Parameters.AddWithValue("@weightInKg", this.WeightInKilograms);
                        cd.Parameters.AddWithValue("@waybillDte", this.AirwayBillDate);
                        cd.Parameters.AddWithValue("@charge", this.Charge);
                        cd.Parameters.AddWithValue("@discount", this.Discount);
                        cd.Parameters.AddWithValue("@subTotal", this.SubTotal);
                        cd.Parameters.AddWithValue("@VAT", this.VAT);
                        cd.Parameters.AddWithValue("@NHIL", this.NationalHealthLevy);
                        cd.Parameters.AddWithValue("@netAmt", this.NetAmount);
                        cd.Parameters.AddWithValue("@insurance", this.Insurance);
                        cd.Parameters.AddWithValue("@total", this.GrandTotal);
                        cd.Parameters.AddWithValue("@comments", this.Comments);
                        cd.Parameters.AddWithValue("@branchId", this.objCompany.Id);
                        cd.Parameters.AddWithValue("@isLoaded", 0);  //just loaded
                        cd.Parameters.AddWithValue("@process", this.objProcess.processName);
                        cd.Parameters.AddWithValue("@status", 0);  //pending approval

                        cd.ExecuteNonQuery();
                        return true;
                        //return (this.Id > 0 ? true : false);
                    }
                    catch (Exception e) {
                        Debug.Print(e.Message);
                        return false;
                    }
                }
            }
            catch { return false; }
        }

        public List<DHL> get() {
            List<DHL> result = null;

            try
            {
                using (var c = Connectors.getConnection()) {
                    try
                    {
                        var cd = new SqlCommand(@"select * from dbo.DHLData where process = @processName;", c);
                        cd.Parameters.AddWithValue("@processName", this.objProcess.processName);

                        using (var d = cd.ExecuteReader()) {
                            if (d.HasRows)
                            {
                                result = new List<DHL>();

                                while (d.Read()) {
                                    var o = new DHL { };

                                    o.Id = int.Parse(d["Id"].ToString());
                                    o.AirWayBillNo = d["airwayBillNo"].ToString();
                                    o.Shipper = d["shipper"].ToString();
                                    o.Receipient = d["receipient"].ToString();
                                    o.WeightInKilograms = Convert.ToDecimal(d["weightInKg"].ToString());
                                    o.AirwayBillDate = Convert.ToDateTime(d["airwayBillDate"].ToString());
                                    o.AirwayBillDateString = o.AirwayBillDate.ToShortDateString();
                                    o.Charge = Convert.ToDecimal(d["charge"].ToString());
                                    o.Discount = Convert.ToDecimal(d["discount"].ToString());
                                    o.SubTotal = Convert.ToDecimal(d["subTotal"].ToString());
                                    o.VAT = Convert.ToDecimal(d["VAT"].ToString());
                                    o.NationalHealthLevy = Convert.ToDecimal(d["NHIL"].ToString());
                                    o.NetAmount = Convert.ToDecimal(d["netAmt"].ToString());
                                    o.Insurance = Convert.ToDecimal(d["insurance"].ToString());
                                    o.GrandTotal = Convert.ToDecimal(d["total"].ToString());
                                    o.objCompany = new Company { Id = int.Parse(d["branch_Id"].ToString()) }.getCompany();

                                    result.Add(o);
                                }
                            }
                            else { return (result); }

                            return (result.ToList<DHL>());
                        }
                    }
                    catch (Exception e) {
                        Debug.Print(e.Message);
                        return (result);
                    }
                }
            }
            catch { return result; }
        }

        public bool isLoaded(string fn)
        {
            using (var c = Connectors.getConnection())
            {
                try
                {
                    var cd = new SqlCommand(@"select count(*) from dbo.DHLData where process = @p and isLoaded = @isL;", c);
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

        public bool PersistDHLData(string fn)
        {
            using (var c = Connectors.getConnection())
            {
                try
                {
                    var cd = new SqlCommand(@"update dbo.DHLData set isLoaded = @isLoaded where process = @process;", c);
                    cd.Parameters.AddWithValue("@isLoaded", 1);
                    cd.Parameters.AddWithValue("@process", fn);

                    cd.ExecuteNonQuery();
                    return true;
                }
                catch (Exception e)
                {
                    Debug.Print(e.Message);
                    return false;
                }
            }
        }

        public bool DeleteDHLFile(string fn)
        {
            using (var c = Connectors.getConnection())
            {
                try
                {
                    using (var trans = c.BeginTransaction())
                    {
                        try
                        {
                            var cd = new SqlCommand(@"delete from dbo.DHLData where process = @process and isLoaded = @isLoadStatus;", c, trans);
                            cd.Parameters.AddWithValue("@process", fn);
                            cd.Parameters.AddWithValue("@isLoadStatus", 0);

                            cd.ExecuteNonQuery();

                            var cmd = new SqlCommand(@"delete from dbo.processLookup where procName = @procName;", c, trans);
                            cmd.Parameters.AddWithValue("@procName", fn);
                            cmd.ExecuteNonQuery();

                            trans.Commit();
                            return true;
                        }
                        catch (Exception ex)
                        {
                            Debug.Print(ex.Message);
                            trans.Rollback();
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
        }

        public List<DHL> getDistinctIASFiles()
        {
            List<DHL> result = null;
            using (var c = Connectors.getConnection())
            {
                try
                {
                    var cd = new SqlCommand(@"select distinct process from dbo.DHLData where isLoaded = @isLoadStatus;", c);
                    cd.Parameters.AddWithValue("@isLoadStatus", 1);

                    using (var d = cd.ExecuteReader())
                    {
                        if (d.HasRows)
                        {
                            result = new List<DHL>();
                            var i = 1;

                            while (d.Read())
                            {
                                var t = new DHL {  };

                                t.Id = i;                               
                                t.objProcess = new Process { processName = d["process"].ToString() };

                                result.Add(t);
                                i++;
                            }
                        }
                        else { return (result); }

                        return (result.ToList<DHL>());
                    }
                }
                catch (Exception e)
                {
                    Debug.Print(e.Message);
                    return (result);
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
                    var cd = new SqlCommand(@"select [status] from dbo.DHLData where Id = @id;", c);
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

        public bool getAuthorizationStatus(int _id)
        {
            //determines if a particular record has been authorized or otherwise
            using (var c = Connectors.getConnection())
            {
                try
                {
                    var cd = new SqlCommand(@"select [status] from dbo.DHLData where Id = @id;", c);
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

        public bool ApproveIASData(int _Id, int official_Id)
        {
            //method is used to approve branch pickup or collection data
            try
            {
                using (var c = Connectors.getConnection())
                {
                    try
                    {
                        var cd = new SqlCommand(@"update dbo.DHLData set status = @status, branchOfficerId = @officerId where Id = @id;", c);
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

        public List<DHL> getDistinctIASRecordsUsingFileStatus(int L, int S) {
            List<DHL> r = null;

            try
            {
                using (var c = Connectors.getConnection()) {
                    try
                    {
                        var cd = new SqlCommand { 
                            Connection = c,
                            CommandType = CommandType.StoredProcedure,
                            CommandText = @"[proc_get_IAS]",
                            CommandTimeout = 20
                        };

                        cd.Parameters.AddWithValue("@isLoaded", L);
                        cd.Parameters.AddWithValue("@stat", S);

                        using (var d = cd.ExecuteReader()) {
                            if (d.HasRows)
                            {
                                r = new List<DHL>();
                                while (d.Read())
                                {
                                    var dd = new DHL { };
                                    dd.objProcess = new Process { Id = int.Parse(d["Id"].ToString()), processName = d["procName"].ToString() };

                                    r.Add(dd);
                                }
                            }
                            else { return (r); }

                            return (r.ToList<DHL>());
                        }
                    }
                    catch (Exception e) {
                        Debug.Print(e.Message);
                        return (r);
                    }
                }
            }
            catch { return r; }
        }

        public bool AuthorizeIASFedexData(int _Id, int official_Id)
        {
            //method is used to approve head office specie data
            try
            {
                using (var c = Connectors.getConnection())
                {
                    try
                    {
                        var cd = new SqlCommand(@"update dbo.DHLData set status = @status, HOfficerId = @officerId where Id = @id;", c);
                        cd.Parameters.AddWithValue("@status", 3);  //FEDEX approval by H/Office
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

        #endregion

    }
}