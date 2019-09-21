import Matter from "matter-js";

import { writePostion, setDBListner } from "./firebase";

let userId = null,
  otherUserId = null,
  otherPosition = null,
  mousedown = false;

const Engine = Matter.Engine,
  Render = Matter.Render,
  Runner = Matter.Runner,
  Composite = Matter.Composite,
  Composites = Matter.Composites,
  Common = Matter.Common,
  MouseConstraint = Matter.MouseConstraint,
  Mouse = Matter.Mouse,
  World = Matter.World,
  Bodies = Matter.Bodies,
  Events = Matter.Events,
  Body = Matter.Body;

// create engine
const engine = Engine.create(),
  world = engine.world;

// create renderer
const render = Render.create({
  element: document.body,
  engine: engine,
  options: {
    width: window.innerWidth,
    height: window.innerHeight,
    wireframes: false
  }
});

Render.run(render);

// create runner
const runner = Runner.create();
Runner.run(runner, engine);

const bodies = [];
const stack = Composites.stack(100, 0, 10, 8, 10, 10, function(x, y) {
  const body = Bodies.circle(x, y, Common.random(15, 30), {
    restitution: 0.6,
    friction: 0.1
  });

  bodies.push(body);

  return body;
});

World.add(world, [
  Bodies.rectangle(0, window.innerHeight - 100, 10000, 50, { isStatic: true }),
  stack
]);

// add mouse control
const mouse = Mouse.create(render.canvas),
  mouseConstraint = MouseConstraint.create(engine, {
    mouse: mouse,
    constraint: {
      stiffness: 0.2,
      render: {
        visible: false
      }
    }
  });

World.add(world, mouseConstraint);

// keep the mouse in sync with rendering
render.mouse = mouse;

// fit the render viewport to the scene
Render.lookAt(render, {
  min: { x: 0, y: 0 },
  max: { x: 800, y: 600 }
});

// wrapping using matter-wrap plugin
const allBodies = Composite.allBodies(world);

for (let i = 0; i < allBodies.length; i += 1) {
  allBodies[i].plugin.wrap = {
    min: { x: render.bounds.min.x - 100, y: render.bounds.min.y },
    max: { x: render.bounds.max.x + 100, y: render.bounds.max.y }
  };
}

const moveCircles = targetPosition => {
  if (targetPosition) {
    bodies.map(body => {
      Body.translate(body, {
        x: (targetPosition.x - body.position.x) * 0.25,
        y: (targetPosition.y - body.position.y) * 0.25
      });
    });
  }
};

Events.on(engine, "afterUpdate", () => {
  if (mousedown) {
    if (mouse && mouse.position && mouse.position.x)
      moveCircles(mouse.position);
  } else if (otherPosition && otherPosition.x) {
    moveCircles(otherPosition);
  }
});

Events.on(mouseConstraint, "mousedown", () => {
  mousedown = true;
  if (userId) {
    writePostion(userId, mouse.position.x, mouse.position.y);
  }
});

Events.on(mouseConstraint, "mouseup", () => {
  mousedown = false;

  if (userId) {
    writePostion(userId, 0, 0);
  }
});

const setOtherPosition = val => {
  otherPosition = val;
};

if (document.getElementById("userId").value) {
  userId = document.getElementById("userId").value;
}

document.getElementById("userId").addEventListener("change", e => {
  userId = e.target.value;
});

if (document.getElementById("otherUserId").value) {
  otherUserId = document.getElementById("otherUserId").value;
}

document.getElementById("otherUserId").addEventListener("change", e => {
  otherUserId = e.target.value;
  if (otherUserId) {
    setDBListner(otherUserId, setOtherPosition);
  }
});
