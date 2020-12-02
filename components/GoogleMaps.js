app.component('GoogleMaps', {
  template: /*html*/ `
  <div class="maps position-relative">
    <info-card
      card-type="maps"
      :social="currentCompany.social"
      :cnpj="currentCompany.cnpj"
      :address="currentCompany.address"
    />

    <div id="map" class="maps-canvas"></div>
  </div>
  `,
  mounted() {
    console.log(google);

    const coordinates = { lat: -16.70, lng: -49.25 };

    map = new google.maps.Map(document.getElementById('map'), {
      center: coordinates,
      zoom: 13,
      disableDefaultUI: true,
    });

    const marker = new google.maps.Marker({
      position: coordinates,
      map: map,
    });
  },
  computed: {
    ...Vuex.mapState([
      'currentCompany'
    ]),
  }
})
