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
    public class Process
    {
        #region Properties

        public int Id { get; set; }
        public string processType { get; set; }
        public string processName { get; set; }

        #endregion

        #region APIs

        public int getOrderRecordCount(string o) {
            var knt = 0;
            using (var con = Connectors.getConnection())
            {
                try
                {
                    var cmd = new SqlCommand
                    {
                        Connection = con,
                        CommandType = CommandType.StoredProcedure,
                        CommandText = @"[proc_fxn_process_getNo]",
                        CommandTimeout = 20
                    };

                    cmd.Parameters.AddWithValue("@param", o);
                    knt = int.Parse(cmd.ExecuteScalar().ToString());

                    return (knt);
                }
                catch (Exception e)
                {
                    Debug.Print(e.Message);
                    return (knt);
                }
            }
        }

        public bool Add() {
            using (var c = Connectors.getConnection()) {
                try
                {
                    var cd = new SqlCommand(@"insert into dbo.ProcessLookup(process,procName) VALUES(@p,@pName);select @@identity as Id;", c);
                    cd.Parameters.AddWithValue("@p", this.processType);
                    cd.Parameters.AddWithValue("@pName", this.processName);

                    this.Id = int.Parse(cd.ExecuteScalar().ToString());
                    return (this.Id > 0 ? true : false);
                }
                catch (Exception e) {
                    Debug.Print(e.Message);
                    return false;
                }
            }
        }

        public List<Process> get() {
            List<Process> result = null;
            using (var con = Connectors.getConnection()) {
                try
                {
                    var cd = new SqlCommand(@"select * from dbo.ProcessLookup where process = @proc order by Id;", con);
                    cd.Parameters.AddWithValue("@proc", this.processType);

                    using (var dr = cd.ExecuteReader()) {
                        if (dr.HasRows) { result = new List<Process>(); }
                        while (dr.Read()) {
                            var p = new Process { };

                            p.Id = int.Parse(dr["Id"].ToString());
                            p.processType = dr["process"].ToString();
                            p.processName = dr["procName"].ToString();

                            result.Add(p);
                        }

                        return (result.ToList<Process>());
                    }
                }
                catch (Exception e) {
                    Debug.Print(e.Message);
                    return (result);
                }
            }
        }

        public List<Process> getProcessNames(int pFlag, string procName) {
            List<Process> rs = null;
            using (var c = Connectors.getConnection()) {
                try
                {
                    var cd = new SqlCommand 
                    { 
                        Connection = c,
                        CommandType = CommandType.StoredProcedure,
                        CommandText = @"[proc_get_collectAuth]",
                        CommandTimeout = 20
                    };

                    cd.Parameters.AddWithValue("@officerFlag", pFlag);
                    cd.Parameters.AddWithValue("@procFlag", procName);

                    using (var d = cd.ExecuteReader()) {
                        if (d.HasRows)
                        {
                            rs = new List<Process>();
                            while (d.Read())
                            {
                                var p = new Process { };

                                p.Id = int.Parse(d["Id"].ToString());
                                p.processName = d["procName"].ToString();
                                p.processType = d["process"].ToString();

                                rs.Add(p);
                            }
                        }
                        else { return (rs); }
                    }

                    return (rs.ToList<Process>());
                }
                catch (Exception e) {
                    Debug.Print(e.Message);
                    return (rs);
                }
            }
        }

        #endregion

    }
}