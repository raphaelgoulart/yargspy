<template>
  <div class="about text-slate-300">
    <h1 class="text-center text-white text-4xl font-bold">ABOUT</h1>
    <p class="pt-8">
      YARGSpy is an unofficial, replay-validation-based leaderboard system for
      <a href="https://yarg.in/">YARG</a> (Yet Another Rhythm Game). Whenever a replay file is
      uploaded, a simulation of that replay is ran internally, and the score is only accepted if the
      simulated score matches the score the replay file claims to have.
    </p>
    <p class="pt-4">
      This means that the only scores that are accepted are ones that are verified to be within the
      rules of the game, ensuring — to an extent — a baseline level of leaderboard integrity.
    </p>
    <p class="pt-4">
      This website was built by
      <a href="https://github.com/raphaelgoulart" target="_blank">raphaelgoulart</a> and
      <a href="https://ruggeryiury.github.io/my-linktree/" target="_blank">Ruggy</a>. If you need
      support, please join our <a href="#">Discord server</a>. If you want to contribute, check out
      the <a href="https://github.com/raphaelgoulart/yarglb" target="_blank">GitHub repository</a>.
    </p>
    <h1 class="py-8 text-center text-4xl font-bold">FREQUENTLY ASKED QUESTIONS</h1>
    <FaqItem q="Why isn't this official?" defaultOpen
      >This is a project made for fun by the aforementioned people, and, although YARG's lead
      maintainers also envision replay validation as a tool for leaderboard integrity, this website
      was made without coordination with them, so it has not been determined whether this project
      aligns with the vision of YARG and its development.<br />Also, while we're doing our best to
      ensure this'll work on a large scale, we have no idea on how it'd actually fare with YARG's
      entire player base, and I'd probably need assistance if I were to maintain this in an
      official capacity.</FaqItem
    >
    <FaqItem q="Will there be a custom version of the game, like what ScoreSpy was to Clone Hero?"
      >This is part of long-term plans, and the way the groundwork is laid out right now should make
      it pretty feasible, but I'll certainly need help with implementing it in the game side.<br />ScoreSpy
      actually started with screenshot submissions; the current version would be the YARG equivalent
      of that.</FaqItem
    >
    <FaqItem q="Will custom engine presets ever be supported?"
      >Short answer: <b>no.</b><br />Long answer: it would unfairly favor easier custom engines, any
      attempts to avoid that by limiting which engine parameters can be changed would be very
      arbitrary and would lead to questions like "why is X combination supported but not Y?", and
      would likely lead to fragmentation in the player base (we already have 3 leaderboards for each
      difficulty — one for each default engine preset — we don't really need any more fragmentation
      than that). Because of those reasons, not supporting custom engine presets is a hard line I
      decided to draw early on.</FaqItem
    >
  </div>
</template>

<script setup lang="ts">
import FaqItem from '@/components/FaqItem.vue'
</script>
