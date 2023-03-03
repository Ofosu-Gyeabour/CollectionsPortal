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
    public class Currency
    {
        #region Properties

        public int Id { get; set; }
        public string nameOfcurrency { get; set; }
        public string symbolOfcurrency { get; set; }

        #endregion

        #region Methods

        public int getId() {
            using (var cn = Connectors.getConnection()) {
                try
                {
                    var cd = new SqlCommand(@"select Id from dbo.Currencies where nameOfcurrency = @cname;", cn);
                    cd.Parameters.AddWithValue("@cname", this.nameOfcurrency);

                    this.Id = int.Parse(cd.ExecuteScalar().ToString());

                    return (this.Id);
                }
                catch (Exception e) {
                    Debug.Print(e.Message);
                    return (this.Id = 0);
                }
            }
        }

        public int getIdbySymbol() {
            using (var cn = Connectors.getConnection())
            {
                try
                {
                    var cd = new SqlCommand(@"select Id from dbo.Currencies where currencySymbol = @csymbol;", cn);
                    cd.Parameters.AddWithValue("@csymbol", this.symbolOfcurrency);

                    this.Id = int.Parse(cd.ExecuteScalar().ToString());

                    return (this.Id);
                }
                catch (Exception e)
                {
                    Debug.Print(e.Message);
                    return (this.Id = 0);
                }
            }
        }

        public List<Currency> get() {
            List<Currency> result = null;
            using (var c = Connectors.getConnection()) {
                try
                {
                    var cd = new SqlCommand { 
                        Connection = c,
                        CommandType = CommandType.Text,
                        CommandText = @"select * from dbo.currencies;",
                        CommandTimeout = 20
                    };

                    using (var d = cd.ExecuteReader()) {
                        if (d.HasRows)
                        {
                            result = new List<Currency>();
                            while (d.Read()) {
                                var cc = new Currency { };

                                cc.Id = int.Parse(d["Id"].ToString());
                                cc.nameOfcurrency = d["nameOfcurrency"].ToString().Trim();
                                cc.symbolOfcurrency = d["currencySymbol"].ToString().Trim();

                                result.Add(cc);
                            }

                            return (result.ToList<Currency>());
                        }
                        else { return (result); }
                    }
                }
                catch (Exception e) {
                    Debug.Print(e.Message);
                    return (result);
                }
            }
        }

        public Currency getCurrency() {
            Currency obj = null;
            using (var c = Connectors.getConnection()) {
                try
                {
                    var cd = new SqlCommand(@"select * from dbo.currencies where Id = @id;", c);
                    cd.Parameters.AddWithValue("@id", this.Id);

                    using (var d = cd.ExecuteReader()) {
                        if (d.HasRows)
                        {
                            obj = new Currency();

                            d.Read();

                            obj.Id = int.Parse(d["Id"].ToString());
                            obj.nameOfcurrency = d["nameOfcurrency"].ToString();
                            obj.symbolOfcurrency = d["currencySymbol"].ToString();

                            return (obj);
                        }
                        else { return (obj); }
                    }
                }
                catch (Exception e) {
                    Debug.Print(e.Message);
                    return (obj);
                }
            }
        }

        #endregion

    }
}