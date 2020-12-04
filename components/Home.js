app.component('Home', {
  template: /*html*/`
  <div class="home">
    <the-navbar :title="title"></the-navbar>

    <main>
      <div class="panel">
        <slider :elements="sliderList" v-slot="{ element, visibility }">
          <info-card class="slider-element"
          :class="visibility"
          :key="element"
          :id="element.cnpjNumber"
          :name="element.name"
          :cnpj="element.cnpj"
          :address="element.address"
          @click="openMap(element.cnpj)"
          />
        </slider>
      </div>
    </main>

    <footer class="footer"></footer>
  </div>`,
  data() {
    return {
      title: 'Localizador de Empresas',
    }
  },
  computed: {
    ...Vuex.mapState([
      'companies',
      'sliderList'
    ]),
  },
  methods: {
    openMap(cnpj) {
      this.$store.dispatch('selectCompany', cnpj);
      this.$router.push('/location');
    }
  },
})