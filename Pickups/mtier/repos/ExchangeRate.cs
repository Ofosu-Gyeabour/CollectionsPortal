using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

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
    public class ExchangeRate
    {
        #region Properties

        public int Id { get; set; }
        public Currency objCurrency { get; set; }
        public double x_rate { get; set; }
        public string dte { get; set; }
        public int isCurrent { get; set; }


        #endregion


        #region Methods

        public bool Add() {
            using (var c = Connectors.getConnection()) {

                    using (var t = c.BeginTransaction()) {
                        try
                        {
                            var cc = new SqlCommand(@"update dbo.XchangeR set isCurrent = @isValue where currency_Id = @cValue;", c, t);
                            cc.Parameters.AddWithValue("@isValue", 0);
                            cc.Parameters.AddWithValue("@cValue", objCurrency.Id);
                            cc.ExecuteNonQuery();

                            var cd = new SqlCommand
                            {
                                Connection = c,
                                CommandType = CommandType.Text,
                                CommandText = @"insert into dbo.xchangeR(currency_Id,x_rate,dte,isCurrent) VALUES(@currency,@xrate,@dte,@isC);",
                                CommandTimeout = 20,
                                Transaction = t
                            };

                            cd.Parameters.AddWithValue("@currency", objCurrency.Id);
                            cd.Parameters.AddWithValue("@xrate", x_rate);
                            cd.Parameters.AddWithValue("@dte", dte);
                            cd.Parameters.AddWithValue("@isC", this.isCurrent);

                            cd.ExecuteNonQuery();

                            t.Commit();

                            return true;
                        }
                        catch (Exception e) {
                            Debug.Print(e.Message);
                            return false;
                        }                       
                    }                                   
            }
        }

        public List<ExchangeRate> get(int FLAG) {
            List<ExchangeRate> x = null;
            using (var c = Connectors.getConnection()) {
                try
                {
                    var cd = new SqlCommand { 
                        Connection = c,
                        CommandType = CommandType.Text,
                        CommandTimeout = 20
                    };

                    var cdString = string.Empty;

                    if (FLAG == 0)
                    {
                        cd.CommandText = @"select * from dbo.xchangeR;";
                    }
                    else {
                        cd.CommandText = @"select * from dbo.xchangeR where isCurrent = @isC;";
                        cd.Parameters.AddWithValue("@isC", FLAG);
                    }

                    using (var d = cd.ExecuteReader()) {
                        if (d.HasRows)
                        {
                            x = new List<ExchangeRate>();

                            while (d.Read()) {
                                var xc = new ExchangeRate { };

                                xc.Id = int.Parse(d["Id"].ToString());
                                xc.objCurrency = new Currency { Id = int.Parse(d["currency_Id"].ToString()) }.getCurrency();
                                xc.x_rate = Convert.ToDouble(d["x_rate"].ToString());
                                xc.dte = d["dte"].ToString();

                                x.Add(xc);
                            }

                            return (x.ToList<ExchangeRate>());
                        }
                        else { return (x); }
                    }
                }
                catch (Exception e) {
                    Debug.Print(e.Message);
                    return (x);
                }
            }
        }

        #endregion

    }
}