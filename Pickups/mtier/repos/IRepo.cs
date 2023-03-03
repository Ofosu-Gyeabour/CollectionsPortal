using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Pickups.mtier.repos
{
    interface IRepo
    {
        bool Add();
        bool Delete();
        int getId();
    }
}
