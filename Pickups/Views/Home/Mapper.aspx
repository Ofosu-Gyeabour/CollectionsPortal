<%@ Page Title="" Language="C#" MasterPageFile="~/Views/Shared/Mapster.Master" Inherits="System.Web.Mvc.ViewPage<dynamic>" %>

<asp:Content ID="Content1" ContentPlaceHolderID="Hd" runat="server"></asp:Content>

<asp:Content ID="Content2" ContentPlaceHolderID="Mp" runat="server">
    <!-- body from master file comes here  &callback=initializeMap -->
    <script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyDov6_0bMEkQL0B69eNm75sNtXUwyLsqsQ"></script>
    <div id="map-canvas"></div>
    
    <script type="text/javascript">
        Ext.onReady(function () {
            var pnl = new Ext.Panel({
                renderTo: Ext.get('map-canvas'),
                height: 660, width: 645,
                draggable: true,
                items: [
                    {
                        id: 'Gmap_panel_test',
                        xtype: 'gmappanel',
                        width: '100%',
                        height: 650,
                        border: true,frame: true,
                        gmapType: 'map',
                        zoomLevel: 13,
                        //set center point
                        setCenter: {
                            lat: 5.5557,
                            lng: -0.1963,
                            
                            marker: {
                                title: 'Kwame Nkrumah Avenue'
                            }
                        }
                    },
                    {
                        layout: 'form', buttonAlign: 'center', width: '100%', height: 100,
                        buttons: [
                            {
                                text: 'Save',
                                width: 50,
                                id: 'save',
                                handler: function () {
                                    //get the center of the map to save
                                    var gmap_cur_latlng = Ext.getCmp('Gmap_panel_test').getMap().getCenter();
                                    var gmap_cur_lat = cur_glatlng.lat();
                                    var gmap_cur_lng = cur_glatlng.lng();

                                    //alert the center point
                                    var al = 'Lattitude - ' + cur_lat + ', Longitude - ' + cur_lng;
                                    alert(al);
                                }
                            }
                        ]
                    }
                ]

            });
        });
    </script>

</asp:Content>
