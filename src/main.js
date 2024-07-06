import { dialogueData, scaleFactor } from "./constants";
import { k } from "./kaboomCtx";
import { displayDialogue, setCamScale } from "./utils";

k.loadSprite("player", "./spritesheet.png", {
  sliceX: 39,
  sliceY: 31,
  anims: {
    "idle-down": 936,
    "walk-down": { from: 936, to: 939, loop: true, speed: 8 },
    "idle-side": 975,
    "walk-side": { from: 975, to: 978, loop: true, speed: 8 },
    "idle-up": 1014,
    "walk-up": { from: 1014, to: 1017, loop: true, speed: 8 },
  },
});

k.loadSprite("map", "./map.png");

k.setBackground(k.Color.fromHex("#000000"));

k.scene("main", async () => {
  // we wait the fetching to be done, and wait again until it get converted to json().
  const theMap = await (await fetch("./map.json")).json();
  const theLayers = theMap.layers;

  const map = k.add([k.sprite("map"), k.pos(0), k.scale(scaleFactor)]);

  const player = k.make([
    k.sprite("player", { anim: "idle-down" }),
    k.area({
      shape: new k.Rect(k.vec2(0, 3), 10, 10),
    }),
    k.body(),
    k.anchor("center"),
    k.pos(),
    k.scale(scaleFactor),
    {
      speed: 250,
      direction: "down",
      isInDialogue: false,
    },
    // "player",
  ]);

  for (const layer of theLayers) {
    if (layer.name === "Boundary") {
      for (const boundary of layer.objects) {
        map.add([
          k.area({
            shape: new k.Rect(k.vec2(0), boundary.width, boundary.height),
          }),
          k.body({ isStatic: true }),
          k.pos(boundary.x, boundary.y),
          boundary.name,
        ]);

        if (boundary.name !== "wall") {
          player.onCollide(boundary.name, () => {
            player.isInDialogue = true;
            displayDialogue(dialogueData[1], () => {
              player.isInDialogue = false;
            }); // once dialogue over, flip the player.isInDialogue
          });
        }
      }

      continue;
    }
    if (layer.name === "Spawnpoint") {
      for (const entity of layer.objects) {
        if (entity.name === "player") {
          player.pos = k.vec2(
            (map.pos.x + entity.x) * scaleFactor,
            (map.pos.y + entity.y) * scaleFactor
          );
          k.add(player);
          continue;
        }
      }
    }
  }

  setCamScale(k);

  k.onResize(() => {
    setCamScale(k);
  });

  k.onUpdate(() => {
    k.camPos(player.pos.x, player.pos.y + 30);
  });

  k.onMouseDown((mouseBtn) => {
    if (mouseBtn !== "left" || player.isInDialogue) return;

    const worldMousePos = k.toWorld(k.mousePos());
    player.moveTo(worldMousePos, player.speed);

    const mouseAngle = player.pos.angle(worldMousePos);

    // imagine a circle in having 0 degrees as horizontal right.
    const upperRight = 50;
    const upperLeft = 125;

    if (
      mouseAngle < upperLeft &&
      mouseAngle > upperRight &&
      player.curAnim() !== "walk-up"
    ) {
      player.play("walk-up");
      player.direction = "up";
      return;
    }

    if (
      mouseAngle > -upperLeft &&
      mouseAngle < -upperRight &&
      player.curAnim() !== "walk-down"
    ) {
      player.play("walk-down");
      player.direction = "down";
      return;
    }

    // imagine a circle where, the middle sector (both up and down) is missing.
    // mouse bigger than left, should side left.
    if (Math.abs(mouseAngle) > upperLeft) {
      player.flipX = false;
      if (player.curAnim() !== "walk-side") player.play("walk-side");
      player.direction = "left";
      return;
    }

    if (Math.abs(mouseAngle) < upperRight) {
      player.flipX = true;
      if (player.curAnim() !== "walk-side") player.play("walk-side");
      player.direction = "right";
      return;
    }
  });

  k.onMouseRelease(() => {
    if (player.direction === "down") {
      player.play("idle-down");
      return;
    }
    if (player.direction === "up") {
      player.play("idle-up");
      return;
    }
    player.play("idle-side");
  });
});

k.go("main");
