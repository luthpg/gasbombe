<script setup lang="ts">
import { ref } from "vue";
import { parameters } from "@/lib/parameters";
import { serverScripts } from "@/lib/server";

defineProps<{ msg: string }>();

const { userAddress } = parameters;

const count = ref(0);
const message = ref("Click to say hello");

const handleHelloButton = async () => {
  message.value = "Waiting...";
  try {
    message.value = await serverScripts.sayHello(userAddress);
  } catch (error) {
    console.error(error);
    message.value = "Error. Check the console.";
  }
};
</script>

<template>
  <h1>{{ msg }}</h1>

  <div class="card">
    <button type="button" @click="count++">count is {{ count }}</button>
    <button type="button" @click="handleHelloButton" :style="{ marginLeft: '10px' }">
      {{ message }}
    </button>
    <p>
      Edit
      <code>components/HelloWorld.vue</code> to test HMR
    </p>
  </div>

  <p>
    Check out
    <a href="https://vuejs.org/guide/quick-start.html#local" target="_blank">create-vue</a>, the official Vue + Vite
    starter
  </p>
  <p>
    Learn more about IDE Support for Vue in the
    <a href="https://vuejs.org/guide/scaling-up/tooling.html#ide-support" target="_blank">Vue Docs Scaling up Guide</a>.
  </p>
  <p class="read-the-docs">Click on the Vite and Vue logos to learn more</p>
</template>

<style scoped>
.read-the-docs {
  color: #888;
}
</style>
