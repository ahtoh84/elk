<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
})
</script>

<template>
  <MainContent>
    <div min-h="[calc(100vh-8rem)]" flex="~ items-center justify-center" p6>
      <UserSignIn :default-server="publicServer" />
    </div>
  </MainContent>
</template>
