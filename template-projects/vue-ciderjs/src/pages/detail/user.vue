<template>
  <div>
    <h2>User Show Page</h2>
    <p>User ID: {{ params.id }}</p>
  </div>
</template>

<script setup lang="ts">
import { useParams } from "@ciderjs/city-gas/vue";

const params = useParams<"/detail/user">();
</script>

<script lang="ts">
export const params = { id: 'string' };
</script>