app.component('GoogleMaps', {
  template: /*html*/ `
  <div class="maps position-relative">
    <info-card
      card-type="maps"
      :id="currentCompany.cnpjNumber"
      :name="currentCompany.name"
      :cnpj="currentCompany.cnpj"
      :address="currentCompany.address"
    />

    <div id="map" class="maps-canvas"></div>
  </div>
  `,
  mounted() {
    const goiania = new google.maps.LatLng(-16.67280792942945, -49.29466264014952);
    const geocoder = new google.maps.Geocoder();
    const address = this.currentCompany.address;
    const companyName = this.currentCompany.name;

    var request = {
      query: this.currentCompany.name,
      fields: ['name', 'geometry', 'icon']
    }

    var map = new google.maps.Map(document.getElementById('map'), {
      center: goiania,
      disableDefaultUI: true,
      zoom: 15,
    });

    var service = new google.maps.places.PlacesService(map);

    service.findPlaceFromQuery(request, function(results, status) {
      if (status === google.maps.places.PlacesServiceStatus.OK) {
        updateMap(map, results[0]);
      } else {
        geocoder.geocode({ address }, function(results, status) {
          if (status === google.maps.GeocoderStatus.OK) {
            updateMap(map, results[0]);
          }
        });
      }
    });

    function updateMap(map, result) {
      const { bounds, location, viewport } = result.geometry;
      const coordinates = bounds ? bounds.getCenter() : location;

      map = new google.maps.Map(document.getElementById('map'), {
        center: coordinates,
        disableDefaultUI: true,
        zoom: 15,
      });

      map.fitBounds(viewport);

      let marker = new google.maps.Marker({
        position: coordinates,
        map: map,
        // collisionBehavior: google.maps.CollisionBehavior.REQUIRED_AND_HIDES_OPTIONAL,
        animation: google.maps.Animation.DROP,
        icon: "https://maps.gstatic.com/mapfiles/api-3/images/spotlight-poi2.png",
        // icon: "https://mts.googleapis.com/vt/icon/name=icons/spotlight/spotlight-waypoint-blue.png&psize=16&font=fonts/Roboto-Regular.ttf&color=ff333333&ax=44&ay=48&scale=1",
        label: {
          text: result.name || companyName,
          color: '#d22c28',
          className: 'maps-label',
          fontSize: '15px',
          fontWeight: '400'
        },
      });
    }
  },
  computed: {
    ...Vuex.mapState([
      'currentCompany'
    ]),
    address() {
      return this.currentCompany.address;
    }
  }
})
