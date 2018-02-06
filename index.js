export default function (kibana) {
  return new kibana.Plugin({
    uiExports: {
      visTypes: [
        'plugins/kibana-percent-diff/percent_diff_vis'
      ]
    }
  });
}
