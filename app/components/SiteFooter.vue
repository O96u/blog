<script setup lang="ts">
import { SITE_NAME } from '~~/shared/blog/site-meta'

const config = useRuntimeConfig()
const year = new Date().getFullYear()
const legalName = computed(() => String(config.public.siteLegalName || SITE_NAME).trim())
const icp = computed(() => String(config.public.siteIcp || '').trim())
const gongan = computed(() => String(config.public.siteGongan || '').trim())
</script>

<template>
  <footer class="portal-footer portal-footer--legal">
    <p class="mag-container portal-footer-legal">
      <span>Copyright © {{ year }} {{ legalName }}</span>
      <template v-if="icp">
        <span aria-hidden="true"> · </span>
        <a class="portal-footer-legal-link" href="https://beian.miit.gov.cn/" rel="noopener noreferrer">{{
          icp
        }}</a>
      </template>
      <template v-if="gongan">
        <span aria-hidden="true"> · </span>
        <span class="portal-footer-gongan">{{ gongan }}</span>
      </template>
    </p>
  </footer>
</template>
