<template>
  <nav>
    <button type="button" @click="goHome">Go Home</button>
    <button type="button" @click="goAbout">Go About</button>
    <button type="button" @click="goUser">Go User 123</button>
  </nav>
</template>

<script setup lang="ts">
import { useNavigate } from "@ciderjs/city-gas/vue";

const navigate = useNavigate();

const goHome = () => navigate("/");
const goAbout = () => navigate("/about");
const goUser = () => navigate("/detail/user", { id: "123" });
</script>

<style scoped>
button {
  margin-right: 10px;
}
</style>