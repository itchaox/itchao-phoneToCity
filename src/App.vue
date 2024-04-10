<!--
 * @Version    : v1.00
 * @Author     : itchaox
 * @Date       : 2023-09-25 20:55
 * @LastAuthor : itchaox
 * @LastTime   : 2024-04-11 00:38
 * @desc       : 
-->
<script setup>
  import Form from './components/Form.vue';
  import { useTheme } from '@/hooks/useTheme';

  useTheme();
</script>

<template>
  <main>
    <Form />
  </main>
</template>

<style scoped>
  main {
    padding: 1rem;
  }
  h4 {
    font-size: calc(1.275rem + 0.3vw);
    margin-bottom: 1rem;
  }
  code {
    font-size: 0.875em;
    color: #d63384;
    word-wrap: break-word;
  }
</style>
