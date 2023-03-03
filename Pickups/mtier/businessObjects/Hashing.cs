using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

using System.Diagnostics;
using System.Security.Cryptography;


namespace Pickups.mtier.businessObjects
{
    public class Hashing
    {
        public static string CreateHash(string cipher)
        {
            //method encrypts a given password
            System.Security.Cryptography.MD5CryptoServiceProvider x = new System.Security.Cryptography.MD5CryptoServiceProvider();
            byte[] data = System.Text.Encoding.ASCII.GetBytes(cipher);
            data = x.ComputeHash(data);
            return System.Text.Encoding.ASCII.GetString(data);
        }

        public static bool MatchHash(string HashDB, string HashUser)
        {
            //method matches the hashed password from a database to the provided by the user
            HashUser = CreateHash(HashUser);
            if (HashUser == HashDB)
                return true;
            else
                return false;
        }
    }
}