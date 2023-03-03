<%@ Page Title="" Language="C#" MasterPageFile="~/Views/Shared/Site.Master" Inherits="System.Web.Mvc.ViewPage<dynamic>" %>

<asp:Content ID="Content1" ContentPlaceHolderID="MainContent" runat="server">
    <div id="map-canvas"></div>
    
    <script src="../../Scripts/ui/mapster.js"></script>
    
    <script type="text/javascript">
        function initMap() {
            var uluru = { lat: -25.363, lng: 131.044 };
            var map = new google.maps.Map(document.getElementById('map-canvas'), {
                zoom: 4,
                center: uluru
            });
            var marker = new google.maps.Marker({
                position: uluru,
                map: map
            });
        }
    </script>
    
    <script async defer type="text/javascript" src="https://maps.googleapis.com/maps/api/js?key=AIzaSyCFp69zTVj55248g0q8t_WnIH4Q519KRHQ&callback=initMap"></script>
</asp:Content>

