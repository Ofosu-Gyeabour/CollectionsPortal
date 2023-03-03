using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Diagnostics;
using System.Configuration;

using System.Data;
using System.Data.Common;
using System.Data.SqlClient;
using System.Data.OleDb;

namespace Pickups.bridge
{
    public static class Connectors
    {
        #region SQL

        private static SqlConnection createConnection()
        {
            var cstring = ConfigurationManager.AppSettings["production"].ToString();

            var conn = new SqlConnection(cstring);
            try
            {
                conn.Open();
                if (conn.State == ConnectionState.Open)
                {
                    return conn;
                }
                else { return conn = null; }
            }
            catch (Exception ex)
            {
                Debug.Print(ex.Message);
                return null;
            }
        }

        public static SqlConnection createGenericConnection(string param)
        {
            var conn = new SqlConnection(param);
            try
            {
                conn.Open();
                if (conn.State == ConnectionState.Open)
                {
                    return conn;
                }
                else { return conn = null; }
            }
            catch (Exception ex)
            {
                Debug.Print(ex.Message);
                return null;
            }
        }

        public static SqlConnection getConnection()
        {
            return (createConnection());
        }

        #endregion

        #region EXCEL

        public static OleDbConnection getExcelConnection(string connectionPath)
        {
            string strcon = @"Provider=Microsoft.Jet.OLEDB.4.0;Data Source=" + connectionPath + ";Extended Properties=\"Excel 8.0;HDR=YES;IMEX=1;Importmixedtypes=text;typeguessrows=0;\"";
            //var cstring = String.Format("Provider=Microsoft.Jet.OLEDB.4.0;Data Source={0};Extended Properties=\"Excel 8.0;HDR=YES;IMEX=1;Importmixedtypes=text;typeguessrows=0;\"", connectionPath);
            var conn = new OleDbConnection(strcon);

            try
            {
                conn.Open();
                if (conn.State == ConnectionState.Open)
                {
                    return conn;
                }
                else { return conn = null; }
            }
            catch (Exception ex) { Debug.Print(ex.Message); return null; }
        }

        public static OleDbConnection getXLSXConnection(string path)
        {
            var connString = "Provider=Microsoft.ACE.OLEDB.12.0;Data Source=" + path + ";Extended Properties=\"Excel 12.0;HDR=Yes;IMEX=2\"";
            var conn = new OleDbConnection(connString);

            try
            {
                conn.Open();
                if (conn.State == ConnectionState.Open)
                {
                    return conn;
                }
                else { return conn = null; }
            }
            catch (Exception ex) { Debug.Print(ex.Message); return null; }
        }

        #endregion

        #region CSV

        public static OleDbConnection getCSVConnection(string fileDirectory)
        {
            //filedirectory can hold path to a multiple of files

            OleDbConnection objConnection = new OleDbConnection("Provider=Microsoft.Jet.OLEDB.4.0;Data Source=" + fileDirectory + ";Extended Properties='text;HDR=No;FMT=Delimited';");

            try
            {
                objConnection.Open();
                if (objConnection.State == ConnectionState.Open)
                {
                    return (objConnection);
                }
                else { return objConnection = null; }
            }
            catch (Exception ex) { Debug.Print(ex.Message); return null; }

        }

        #endregion

    }
}