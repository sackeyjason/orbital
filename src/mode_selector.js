export default function ModeSelector(select, events) {
  this.mode = "normal";
  this.init = () => {
    select.addEventListener("change", () => {
      this.mode = select.value;
      if (select.value === 'nuts') {
        events.push('go nuts');
      }
    })
    select.value = 'normal';
    
  }
}
