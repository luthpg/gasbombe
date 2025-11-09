export function setupSayHello(element) {
  let message = "Click to say hello";
  element.innerHTML = message;
  const handleSayHello = () => {
    if (!("google" in globalThis)) {
      message = "Error. `google` is not defined";
      element.innerHTML = message;
      return;
    }
    google.script.run
      .withSuccessHandler((result) => {
        message = result;
        element.innerHTML = message;
      })
      .withFailureHandler((error) => {
        console.error(error);
        message = "Error. Check the console.";
        element.innerHTML = message;
      })
      .sayHello(userAddress);
  };
  element.addEventListener("click", handleSayHello);
}
