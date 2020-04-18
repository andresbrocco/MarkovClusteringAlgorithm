$(document).ready(

  function() {
    const $inflationSpan = $('.inflationSpan');
    const $inflationValue = $('#inflationValue');
    $inflationSpan.html($inflationValue.val());
    $inflationValue.on('input change', () => { $inflationSpan.html($inflationValue.val()); setInflationValue($inflationValue.val())});

    const $pruneTresholdSpan = $('.pruneTresholdSpan');
    const $pruneTresholdValue = $('#pruneTresholdValue');
    $pruneTresholdSpan.html($pruneTresholdValue.val());
    $pruneTresholdValue.on('input change', () => { $pruneTresholdSpan.html($pruneTresholdValue.val()); setPruneTresholdValue($pruneTresholdValue.val())});

    const $animationSpeedSpan = $('.animationSpeedSpan');
    const $animationSpeedValue = $('#animationSpeedValue');
    $animationSpeedSpan.html($animationSpeedValue.val());
    $animationSpeedValue.on('input change', () => { $animationSpeedSpan.html($animationSpeedValue.val()); setAnimationSpeed($animationSpeedValue.val())});

  }

);
