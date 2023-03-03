using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

using System.Diagnostics;
using System.Data;
using System.Data.Common;
using System.Data.SqlClient;

using Pickups.bridge;
using Pickups.mtier.businessObjects;
using System.Configuration;
using Pickups.mtier.repos;

namespace Pickups.mtier.notifications {

    public class DashStatistics {

        public DashStatistics() { 
            try
            {
                conn = Connectors.getConnection();

            }
            catch { }
        }

        public SqlConnection conn;
        public int routesValue { get; set; }
        public int tellerNumber { get; set; }
        public int pickupClients { get; set; }
        public int activeUsers { get; set; }
        public int loggedUsers { get; set; }
        public List<BuillionData> topTenCashPickup { get; set; }

        #region Methods

        public void ComputeValues() {
            try
            {
                this.routesValue = this.getTotalRoutesCount();
                this.tellerNumber = this.getTotalTellerCount();
                this.pickupClients = this.getTotalPickupClientCount();
                this.activeUsers = this.getTotalActiveUsers();
                this.loggedUsers = this.getTotalLoggedUsers();
                this.topTenCashPickup = this.getTopTenByAmount();
            }
            catch 
            { 
            
            }
        }

        private int getTotalRoutesCount() { 
            try
            {
                if (conn != null)
                {
                    var cd = new SqlCommand(@"select count(*) from dbo.Routes_lookup;", conn);
                    this.routesValue = int.Parse(cd.ExecuteScalar().ToString());

                    return (this.routesValue);
                }
                else { return 0; }
            }
            catch { return 0; }
        }

        private int getTotalTellerCount() { 
            try
            {
                if (conn != null)
                {
                    var cd = new SqlCommand(@"select count(*) from dbo.Teller", conn);
                    this.tellerNumber = int.Parse(cd.ExecuteScalar().ToString());

                    return (this.tellerNumber);
                }
                else { return 0; }
            }
            catch { return 0; }
        }

        private int getTotalPickupClientCount() {
            try
            {
                if (conn != null)
                {
                    var cd = new SqlCommand(@"select count(distinct(customerName)) from dbo.[Collection];", conn);
                    this.pickupClients = int.Parse(cd.ExecuteScalar().ToString());

                    return (this.pickupClients);
                }
                else { return 0; }
            }
            catch {
                return 0;
            }
        }

        private int getTotalActiveUsers() {
            try
            {
                if (conn != null)
                {
                    var cd = new SqlCommand(@"select count(*) from dbo.Usr where isActive = @activeStatus;", conn);
                    cd.Parameters.AddWithValue("@activeStatus", 1);

                    this.activeUsers = int.Parse(cd.ExecuteScalar().ToString());

                    return (this.activeUsers);
                }
                else { return 0; }
            }
            catch {
                return 0;
            }
        }

        private int getTotalLoggedUsers() {
            try
            {
                if (conn != null)
                {
                    var cd = new SqlCommand(@"select count(*) from dbo.Usr where isLogged = @isLogged", conn);
                    cd.Parameters.AddWithValue("@isLogged", 1);

                    this.loggedUsers = int.Parse(cd.ExecuteScalar().ToString());

                    return (this.loggedUsers);
                }
                else { return 0; }
            }
            catch {
                return 0;
            }
        }

        private List<BuillionData> getTopTenByAmount() {
            List<BuillionData> rs = null;

            try
            {
                if (conn != null)
                {
                    var cd = new SqlCommand(@"select top 10 customerName,sum(total) as Total from dbo.[collection] group by customerName order by customerName, sum(total) desc", conn);
                    using (var d = cd.ExecuteReader()) {
                        if (d.HasRows)
                        {
                            int i = 1;
                            rs = new List<BuillionData>();
                            while (d.Read()) {
                                var b = new BuillionData { };
                                b.Id = i;
                                b.objCashCollection = new xlCRUD.CashColl { 
                                    customerName = d["customerName"].ToString(),
                                    amt = Convert.ToDecimal(d["Total"].ToString())
                                };

                                i++;
                                rs.Add(b);
                            }

                            return (rs.ToList<BuillionData>());
                        }
                        else { return (rs); }
                    }
                }
                else { return rs; }
            }
            catch {
                return rs;
            }
        }

        #endregion

    }

}