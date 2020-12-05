app.component('Slider', {
  props:{
    elements: Object,
  },
  template:/*html*/`
    <div class="container flex-column-center">
      <div class="slider">
        <div class="slider-control slider-control-left"
          @click="prev()"
          @mouseenter="prev()">
          <span class="slider-button slider-button-left" />
        </div>

        <transition-group class="slider-content" name="slider-list" tag="div">
          <slot v-for="(element, index) in elements"
            :visibility="elementVisibility(index)"
            :element="element"
          ></slot>
        </transition-group>

        <div class="slider-control slider-control-right"
          @click="next()"
          @mouseenter="next()">
          <span class="slider-button slider-button-right" />
        </div>
      </div>
    </div>`,
  computed: {
    ...Vuex.mapState([
      'viewportWidth'
    ]),
    threshold() {
      return Math.round( (this.viewportWidth - 100) / 260 );
    },
  },
  methods: {
    elementVisibility(i) {
      var elementClass = '';
      var count = this.elements.length;
      var threshold  = this.threshold;
      var start = Math.floor( (count - threshold) / 2 );
      var end = count - start - (threshold % 2);

      if(start >= i || i >= end) {
        elementClass += 'slider-element-' + ( i == start || i == end ? 'disabled' :  'hidden');
      }

      return elementClass;
    },
    next: _.throttle(function() {
      this.$store.commit('rotateListLeft')
    }, 600),
    prev: _.throttle(function() {
      this.$store.commit('rotateListRight')
    }, 600),
  },
})