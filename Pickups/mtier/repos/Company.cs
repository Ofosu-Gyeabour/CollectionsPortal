using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

using System.Diagnostics;
using System.Data;
using System.Data.Common;
using System.Data.SqlClient;

using Pickups.bridge;

namespace Pickups.mtier.repos
{
    public class Company
        :IRepo
    {
        #region Properties

        public int Id { get; set; }
        public string branchCode { get; set; }
        public string branchName { get; set; }
        public string branchAddress { get; set; }
        public string branchMnemonic { get; set; }
        public Region objRegion { get; set; }
        public string internalAccount { get; set; }
        public string notifiers { get; set; }

        #endregion

        #region Interface Implementation

        public bool Add() {
            using (var c = Connectors.getConnection()) {
                try
                {
                    var cd = new SqlCommand { 
                        Connection = c,
                        CommandType = CommandType.Text,
                        CommandText = @"insert into dbo.Company VALUES(@brCode,@brName,@brAddr,@mnemonic,@brRegion,@brIntAccnt,@brNotif);select @@identity as Id;",
                        CommandTimeout = 20
                    };

                    cd.Parameters.AddWithValue("@brCode", branchCode);
                    cd.Parameters.AddWithValue("@brName", branchName);
                    cd.Parameters.AddWithValue("@brAddr", branchAddress);
                    cd.Parameters.AddWithValue("@mnemonic", branchMnemonic);
                    cd.Parameters.AddWithValue("@brRegion", objRegion.getId());
                    cd.Parameters.AddWithValue("@brIntAccnt", internalAccount);
                    cd.Parameters.AddWithValue("@brNotif", notifiers);

                    return (this.Id > 0 ? true : false);
                }
                catch (Exception e) {
                    Debug.Print(e.Message);
                    return false;
                }
            }
        }

        public bool Delete() {
            using (var c = Connectors.getConnection()) {
                try
                {
                    var cd = new SqlCommand(@"delete from dbo.Company where branchId = @brCode;", c);
                    cd.Parameters.AddWithValue("@brCode", this.branchCode);

                    cd.ExecuteNonQuery();
                    return true;
                }
                catch (Exception e) {
                    Debug.Print(e.Message);
                    return false;
                }
            }
        }

        public int getId() {
            using (var c = Connectors.getConnection()) {
                try
                {
                    var cd = new SqlCommand(@"select Id from dbo.Company where branch_name = @brName;", c);
                    cd.Parameters.AddWithValue("@brName", this.branchName);

                    this.Id = int.Parse(cd.ExecuteScalar().ToString());
                    return (this.Id);
                }
                catch (Exception e) {
                    Debug.Print(e.Message);
                    return (this.Id);
                }
            }
        }

        public int getIdUsingBranchCode()
        {
            using (var c = Connectors.getConnection())
            {
                try
                {
                    var cd = new SqlCommand(@"select Id from dbo.Company where branchId = @brID;", c);
                    cd.Parameters.AddWithValue("@brID", this.branchCode);

                    this.Id = int.Parse(cd.ExecuteScalar().ToString());
                    return (this.Id);
                }
                catch (Exception e)
                {
                    Debug.Print(e.Message);
                    return (this.Id);
                }
            }
        }

        public string getCompanyName() {
            using (var c = Connectors.getConnection())
            {
                try
                {
                    var cd = new SqlCommand(@"select branch_name from dbo.Company where Id = @bId;", c);
                    cd.Parameters.AddWithValue("@bId", this.Id);

                    this.branchName = cd.ExecuteScalar().ToString();
                    return (this.branchName);
                }
                catch (Exception e)
                {
                    Debug.Print(e.Message);
                    return (this.branchName);
                }
            }
        }

        public Company getCompany()
        {
            var o = new Company { };
            using (var c = Connectors.getConnection())
            {
                try
                {
                    var cd = new SqlCommand(@"select * from dbo.Company where Id = @bId;", c);
                    cd.Parameters.AddWithValue("@bId", this.Id);

                    var d = cd.ExecuteReader();

                    d.Read();

                    o.Id = this.Id;
                    o.branchCode = d["branchId"].ToString();
                    o.branchName = d["branch_name"].ToString();
                    o.branchMnemonic = d["mnemonic"].ToString();
                    o.objRegion = new Region { Id = int.Parse(d["region"].ToString()) };

                    return (o);
                }
                catch (Exception e)
                {
                    Debug.Print(e.Message);
                    return (o);
                }
            }
        }

        public Company getCompanyUsingCode()
        {
            var o = new Company { };
            using (var c = Connectors.getConnection())
            {
                try
                {
                    var cd = new SqlCommand(@"select * from dbo.Company where branchId = @bcode;", c);
                    cd.Parameters.AddWithValue("@bcode", this.branchCode);

                    var d = cd.ExecuteReader();

                    d.Read();

                    o.Id = int.Parse(d["Id"].ToString());
                    o.branchCode = d["branchId"].ToString();
                    o.branchName = d["branch_name"].ToString();
                    o.branchMnemonic = d["mnemonic"].ToString();
                    o.objRegion = new Region { Id = int.Parse(d["region"].ToString()) };

                    return (o);
                }
                catch (Exception e)
                {
                    Debug.Print(e.Message);
                    return (o);
                }
            }
        }

        public List<Company> get() {
            List<Company> rs = null;
            using (var c = Connectors.getConnection()) {
                try
                {
                    var cmd = new SqlCommand(@"select * from dbo.Company;", c);
                    var d = cmd.ExecuteReader();

                    if (d.HasRows) { rs = new List<Company>(); }
                    while (d.Read()) {
                        var co = new Company { };
                        co.Id = int.Parse(d["Id"].ToString());
                        co.branchCode = d["branchId"].ToString();
                        co.branchName = d["branch_name"].ToString();
                        co.branchMnemonic = d["mnemonic"].ToString();

                        rs.Add(co);
                    }

                    return (rs.ToList<Company>());
                }
                catch (Exception e) {
                    Debug.Print(e.Message);
                    return rs;
                }
            }
        }

        #endregion


    }
}