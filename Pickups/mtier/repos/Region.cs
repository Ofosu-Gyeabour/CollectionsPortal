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
    public class Region
        :IRepo
    {
        #region Properties

        public int Id { get; set; }
        public string administrativeName { get; set; } //name of region

        #endregion

        #region Interface Implementation

        public bool Add() {
            using (var c = Connectors.getConnection()) {
                try
                {
                    var cd = new SqlCommand(@"insert into dbo.Region(adminRegion) VALUES(@adminRegion);select @@identity as Id;", c);
                    cd.Parameters.AddWithValue("@adminRegion", this.administrativeName);

                    this.Id = int.Parse(cd.ExecuteScalar().ToString());
                    return (this.Id>0 ? true: false);
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
                    var cd = new SqlCommand(@"delete from dbo.Region where Id = @id;", c);
                    cd.Parameters.AddWithValue("@id", this.Id);

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
                    var cd = new SqlCommand(@"select Id from dbo.Region where adminRegion = @adminRegion;", c);
                    cd.Parameters.AddWithValue("@adminRegion", this.administrativeName);

                    this.Id = int.Parse(cd.ExecuteScalar().ToString());

                    return (this.Id);
                }
                catch (Exception e) {
                    Debug.Print(e.Message);
                    return (this.Id);
                }
            }
        }

        #endregion

    }
}