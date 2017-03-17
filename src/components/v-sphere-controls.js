import Vue from 'vue';

export default {
  name: 'v-sphere-controls',
  props: {
  },
  data() {
    // do we always have a sphere??
    return {
      sphere: this.$root.$refs.sphere
    };
  },
  mounted() {

    // wait for first render
    Vue.nextTick(() => {
    });
  },
  computed: {
  },
  methods: {
  }

};
