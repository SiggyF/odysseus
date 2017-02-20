<template>
  <main>
    <v-content>
      <v-container fluid>
        <v-card>
          <v-card-text>
            <canvas class="sphere"></canvas>
            <video :src="src" autoplay loop controls class="depth"></video>
          </v-card-text>
        </v-card>
      </v-container>
    </v-content>


  </main>

</template>

<script src="components/v-sphere.js"></script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style src="components/v-sphere.scss"></style>
<style src="vuetify/dist/vuetify.min.css"></style>
