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
    const goiania = new google.maps.LatLng(-16.681010707655762, -49.25628136315215);
    const { name, address } = this.currentCompany;

    var map = new google.maps.Map(document.getElementById('map'), {
      center: goiania,
      disableDefaultUI: true,
      zoom: 15,
      mapId: "3f20e08f1addea6d",
    });

    findPlaceByName()
      .then(onPlaceFound)
      .then(updateMap);

    // service.findPlaceFromQuery(request, function(results, status) {
    //   if (status === google.maps.places.PlacesServiceStatus.OK) {
    //     updateMap(map, results[0]);
    //   } else {
    //     geocoder.geocode({ address }, function(results, status) {
    //       if (status === google.maps.GeocoderStatus.OK) {
    //         updateMap(map, results[0]);
    //       }
    //     });
    //   }
    // });

    ///// Helper Functions


    function findPlaceByAddress() {
      const geocoder = new google.maps.Geocoder();
      return geocoder.geocode({ address }, function(result, status) {
        var results = result || {};
        results.status = status;

        return results;
      });
    }

    function findPlaceByName() {
      var service = new google.maps.places.PlacesService(map);
      var request = { query: name, fields: ['name', 'geometry'] }

      return service.findPlaceFromQuery(request, function(result, status) {
        var results = result || {};
        results.status = status;

        return results;
      });
    }

    function onPlaceFound(placesResult) {
      return findPlaceByAddress().then(function (geocoderResult) {
        return bestResult({ placesResult, geocoderResult });
      });
    }

    function bestResult(results) {
      const { placesResult, geocoderResult } = results;

      if (placesResult.status === google.maps.places.PlacesServiceStatus.OK)
        return placesResult;
      else
        return geocoderResult;
    }

    function updateMap(result) {
      const { bounds, location, viewport } = result.geometry;
      const coordinates = bounds ? bounds.getCenter() : location;

      map.fitBounds(viewport);
      const { OPTIONAL_AND_HIDES_LOWER_PRIORITY, REQUIRED_AND_HIDES_OPTIONAL } = google.maps.CollisionBehavior;

      new google.maps.Marker({
        position: coordinates,
        map: map,
        collisionBehavior: OPTIONAL_AND_HIDES_LOWER_PRIORITY,
        animation: google.maps.Animation.DROP,
        icon: "https://maps.gstatic.com/mapfiles/api-3/images/spotlight-poi2.png",
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
    },
    name() {
      return this.currentCompany.name;
    },
    PlacesServiceStatusOK() {
      return google.maps.places.PlacesServiceStatus.OK;
    },
    GeocoderStatusOK() {
      return google.maps.GeocoderStatus.OK;
    }
  }
})
