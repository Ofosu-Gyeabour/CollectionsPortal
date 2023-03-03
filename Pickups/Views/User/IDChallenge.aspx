<%@ Page Title="" Language="C#" MasterPageFile="~/Views/Shared/Login.Master" Inherits="System.Web.Mvc.ViewPage<dynamic>" %>

<asp:Content ID="Content1" ContentPlaceHolderID="LoginPlaceHolder" runat="server">

    <!--<marquee behavior="right" direction="right" scrollamount="25">-->
        <img src="../../Images/goog.jpg" />
    <!--</marquee>-->

    <form class="box login">
            <fieldset class="boxBody" style="height:7px;"><h2><div><bold>COURIER BILLING SYSTEM</bold></div></h2></fieldset>
	        <fieldset class="boxBody">
	          <label>Username</label>
	          <input type="text" id="usr" title="enter username" class="usrname" tabindex="1" required="required" style="text-align:center;">
              <label>Password</label>
	          <input id="pwd" type="password" title="enter password" class="pwd" tabindex="2" required="required" style="text-align:center;">
              <div id="dvstat"></div>
	        </fieldset>
	        
            <footer>
	            <!--<label><input type="checkbox" tabindex="3">Know your ICT Policy</label>-->
	            <input type="submit" class="btnLogin" value="Login" tabindex="4"><br />
                <div class="content-wrapper">
                    <div class="float-left">
                        <p>&copy; <%: DateTime.Now.Year %>-<b><strong>NIB Ltd</strong></b></p>
                    </div>
                </div>
	        </footer>
    </form>


    <script type="text/javascript">
        $(document).ready(function () {
            $('.btnLogin').click(function (evnt) {
                evnt.preventDefault();

                $.getJSON('/User/Login', { usrname: $('#usr').val(), pwd: $('#pwd').val() },
                function (msg) {
                    if (msg.status.toString() == "true") {
                        
                        $('div#dvstat').empty().append('<b style="font-size:15px;color:green;">Login success. Redirecting...</b>').fadeIn('slow').fadeOut('slow');
                        if (msg.uprofile.toString() == "ADM") {
                            window.location = "/Home/PickupPost";
                        }
                        if (msg.uprofile.toString() == "BRANCH_USER") {
                            window.location = "/Home/BranchVerification";
                        }
                    }
                    else if (msg.msg.toString() == "Incorrect login credentials") {
                        $('div#dvstat').empty().append('<b style="font-size:15px;color:red;">Incorrect login credentials.Please try again</b>').fadeIn('slow').fadeOut('slow');
                    }
                    else if (msg.msg.toString() == "User account is de-activated") {
                        $('div#dvstat').empty().append('<b style="font-size:12px;color:red;">User account is de-activated.Please contact Admin</b>').fadeIn('slow').fadeOut('slow');
                    }
                });

            });
        });
        </script>

</asp:Content>

<asp:Content ID="Content2" ContentPlaceHolderID="head" runat="server">
</asp:Content>
