import callAnimation from ".././animations/call.json";
import callRejectionAnimation from ".././animations/call-rejected.json";

const callOptions = {
  loop: true,
  autoplay: true,
  animationData: callAnimation,
  rendererSettings: {
    preserveAspectRatio: "xMidYMid slice",
  },
};

const callRejectionOptions = {
  loop: true,
  autoplay: true,
  animationData: callRejectionAnimation,
  rendererSettings: {
    preserveAspectRatio: "xMidYMid slice",
  },
};

export { callOptions, callRejectionOptions };
