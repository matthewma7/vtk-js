import macro                             from 'vtk.js/Sources/macro';
import vtkMath                           from 'vtk.js/Sources/Common/Core/Math';
import vtkInteractorStyleTrackballCamera from 'vtk.js/Sources/Interaction/Style/InteractorStyleTrackballCamera';

const { vtkWarningMacro, vtkErrorMacro } = macro;

// ----------------------------------------------------------------------------
// Global methods
// ----------------------------------------------------------------------------

const eventsWeHandle = [
  'Animation',
  'Enter',
  'Leave',
  'MouseMove',
  'LeftButtonPress',
  'LeftButtonRelease',
  'MiddleButtonPress',
  'MiddleButtonRelease',
  'RightButtonPress',
  'RightButtonRelease',
  'MouseWheelForward',
  'MouseWheelBackward',
  'Expose',
  'Configure',
  'Timer',
  'KeyPress',
  'KeyUp',
  'Char',
  'Delete',
  'StartPinch',
  'Pinch',
  'EndPinch',
  'StartPan',
  'Pan',
  'EndPan',
  'StartRotate',
  'Rotate',
  'EndRotate',
  'Tap',
  'LongTap',
  'Swipe',
];

function preventDefault(event) {
  event.stopPropagation();
  event.preventDefault();
  return false;
}

// ----------------------------------------------------------------------------
// vtkRenderWindowInteractor methods
// ----------------------------------------------------------------------------

function vtkRenderWindowInteractor(publicAPI, model) {
  // Set our className
  model.classHierarchy.push('vtkRenderWindowInteractor');

  // Public API methods

  //----------------------------------------------------------------------
  publicAPI.start = () => {
  // Let the compositing handle the event loop if it wants to.
  // if (publicAPI.HasObserver(vtkCommand::StartEvent) && !publicAPI.HandleEventLoop) {
  //   publicAPI.invokeEvent({ type: 'StartEvent' });
  //   return;
  // }

    // As a convenience, initialize if we aren't initialized yet.
    if (!model.initialized) {
      publicAPI.initialize();
      if (!model.initialized) {
        return;
      }
    }
    // Pass execution to the subclass which will run the event loop,
    // this will not return until TerminateApp is called.
    publicAPI.startEventLoop();
  };

  //----------------------------------------------------------------------
  publicAPI.setRenderWindow = (aren) => {
    vtkErrorMacro('you want to call setView(view) instead of setRenderWindow on a vtk.js  interactor');
  };

  //----------------------------------------------------------------------
  publicAPI.setInteractorStyle = (style) => {
    if (model.interactorStyle !== style) {
      if (model.interactorStyle != null) {
        model.interactorStyle.setInteractor(null);
      }
      model.interactorStyle = style;
      if (model.interactorStyle != null) {
        if (model.interactorStyle.getInteractor() !== publicAPI) {
          model.interactorStyle.setInteractor(publicAPI);
        }
      }
    }
  };

  //---------------------------------------------------------------------
  publicAPI.initialize = () => {
    model.initialized = true;
    publicAPI.enable();
    publicAPI.render();
  };

  publicAPI.enable = () => publicAPI.setEnabled(true);

  publicAPI.disable = () => publicAPI.setEnabled(false);

  publicAPI.startEventLoop = () => vtkWarningMacro('empty event loop');

  publicAPI.setEventPosition = (xv, yv, zv, pointer) => {
    model.pointerIndex = pointer;
    model.lastEventPositions.set(pointer, model.eventPositions.get(pointer));
    model.eventPositions.set(pointer, { x: xv, y: yv, z: zv });
  };

  publicAPI.setAnimationEventPosition = (xv, yv, zv, pointer) => {
    model.lastAnimationEventPositions.set(pointer, model.animationEventPositions.get(pointer));
    model.animationEventPositions.set(pointer, { x: xv, y: yv, z: zv });
  };

  publicAPI.getEventPosition = pointer => model.eventPositions.get(pointer);

  publicAPI.getLastEventPosition = pointer => model.lastEventPositions.get(pointer);

  publicAPI.getAnimationEventPosition = pointer => model.animationEventPositions.get(pointer);

  publicAPI.getLastAnimationEventPosition = pointer => model.lastAnimationEventPositions.get(pointer);

  publicAPI.bindEvents = (canvas) => {
    model.canvas = canvas;
    canvas.addEventListener('contextmenu', preventDefault);
    canvas.addEventListener('click', preventDefault);
    canvas.addEventListener('mousewheel', publicAPI.handleWheel);
    canvas.addEventListener('DOMMouseScroll', publicAPI.handleWheel);

    canvas.addEventListener('mousedown', publicAPI.handleMouseDown);
    document.querySelector('body').addEventListener('keypress', publicAPI.handleKeyPress);
    document.querySelector('body').addEventListener('keyup', publicAPI.handleKeyUp);
    canvas.addEventListener('mouseup', publicAPI.handleMouseUp);
    canvas.addEventListener('mousemove', publicAPI.handleMouseMove);
    canvas.addEventListener('touchstart', publicAPI.handleTouchStart, false);
    canvas.addEventListener('touchend', publicAPI.handleTouchEnd, false);
    canvas.addEventListener('touchcancel', publicAPI.handleTouchEnd, false);
    canvas.addEventListener('touchmove', publicAPI.handleTouchMove, false);
  };

  publicAPI.unbindEvents = (canvas) => {
    canvas.removeEventListener('contextmenu', preventDefault);
    canvas.removeEventListener('click', preventDefault);
    canvas.removeEventListener('mousewheel', publicAPI.handleWheel);
    canvas.removeEventListener('DOMMouseScroll', publicAPI.handleWheel);

    canvas.removeEventListener('mousedown', publicAPI.handleMouseDown);
    document.querySelector('body').removeEventListener('keypress', publicAPI.handleKeyPress);
    document.querySelector('body').removeEventListener('keyup', publicAPI.handleKeyUp);
    canvas.removeEventListener('mouseup', publicAPI.handleMouseUp);
    canvas.removeEventListener('mousemove', publicAPI.handleMouseMove);
    canvas.removeEventListener('touchstart', publicAPI.handleTouchStart);
    canvas.removeEventListener('touchend', publicAPI.handleTouchEnd);
    canvas.removeEventListener('touchcancel', publicAPI.handleTouchEnd);
    canvas.removeEventListener('touchmove', publicAPI.handleTouchMove);
  };

  publicAPI.handleKeyPress = (event) => {
    model.controlKey = event.ctrlKey;
    model.altKey = event.altKey;
    model.shiftKey = event.shiftKey;
    model.key = event.key;
    model.keyCode = String.fromCharCode(event.charCode);
    publicAPI.keyPressEvent();
    publicAPI.charEvent();
  };

  publicAPI.handleKeyUp = (event) => {
    model.controlKey = event.ctrlKey;
    model.altKey = event.altKey;
    model.shiftKey = event.shiftKey;
    model.key = event.key;
    publicAPI.keyUpEvent();
  };

  publicAPI.handleMouseDown = (event) => {
    event.stopPropagation();
    event.preventDefault();

    // intentioanlly done twice
    publicAPI.setEventPosition(event.clientX, model.canvas.clientHeight - event.clientY + 1, 0, 0);
    publicAPI.setEventPosition(event.clientX, model.canvas.clientHeight - event.clientY + 1, 0, 0);
    model.controlKey = event.ctrlKey;
    model.altKey = event.altKey;
    model.shiftKey = event.shiftKey;
    switch (event.which) {
      case 1:
        publicAPI.leftButtonPressEvent();
        break;
      case 2:
        publicAPI.middleButtonPressEvent();
        break;
      case 3:
        publicAPI.rightButtonPressEvent();
        break;
      default:
        vtkErrorMacro(`Unknown mouse button pressed: ${event.which}`);
        break;
    }
  };

  publicAPI.requestAnimation = (requestor) => {
    model.eventPositions.forEach((value, key) => {
      model.lastAnimationEventPositions.set(key, value);
      model.animationEventPositions.set(key, value);
    });
    model.recentFrameTime = -1.0;
    model.lastFrameStart = new Date().getTime();
    model.animationRequest = requestAnimationFrame(publicAPI.handleAnimation);
  };

  publicAPI.isAnimating = () => (model.animationRequest !== null);

  publicAPI.cancelAnimation = (requestor) => {
    if (model.animationRequest) {
      cancelAnimationFrame(model.animationRequest);
      model.animationRequest = null;
      model.recentFrameTime = 0.0;
    }
  };

  publicAPI.handleMouseMove = (event) => {
    publicAPI.setEventPosition(event.clientX, model.canvas.clientHeight - event.clientY + 1, 0, 0);
    event.stopPropagation();
    event.preventDefault();
    publicAPI.setPointerIndex(0);
    publicAPI.mouseMoveEvent();
  };

  publicAPI.handleAnimation = () => {
    const currTime = new Date().getTime();
    if (model.recentFrameTime === -1.0) {
      model.recentFrameTime = 1.0 / 30.0;  // initialize to 30 fps
    } else {
      // moving average, past 10 frames == 95% of the value
      model.recentFrameTime =
        (0.75 * model.recentFrameTime) + (0.25 * (currTime - model.lastFrameStart) / 1000.0);
    }
    model.recentFrameTime = Math.max(0.001, model.recentFrameTime);
    model.lastFrameStart = currTime;
    model.eventPositions.forEach((value, key) => {
      model.lastAnimationEventPositions.set(key, model.animationEventPositions.get(key));
      model.animationEventPositions.set(key, value);
    });
    publicAPI.animationEvent();
    model.animationRequest = requestAnimationFrame(publicAPI.handleAnimation);
  };

  publicAPI.handleWheel = (event) => {
    event.stopPropagation();
    event.preventDefault();

    let wheelDelta = 0;
    // let mode = '';
    if (event.wheelDeltaX === undefined) {
      // mode = 'detail';
      wheelDelta = -event.detail * 2;
    } else {
      // mode = 'wheelDeltaY';
      wheelDelta = event.wheelDeltaY;
    }
    publicAPI.setScale(publicAPI.getScale() *
      Math.max(0.01, (wheelDelta + 1000.0) / 1000.0));
    publicAPI.pinchEvent();
  };

  publicAPI.handleMouseUp = (event) => {
    event.stopPropagation();
    event.preventDefault();

    publicAPI.setEventPosition(event.clientX, model.canvas.clientHeight - event.clientY + 1, 0, 0);
    switch (event.which) {
      case 1:
        publicAPI.leftButtonReleaseEvent();
        break;
      case 2:
        publicAPI.middleButtonReleaseEvent();
        break;
      case 3:
        publicAPI.rightButtonReleaseEvent();
        break;
      default:
        vtkErrorMacro(`Unknown mouse button released: ${event.which}`);
        break;
    }
  };

  publicAPI.handleTouchStart = (event) => {
    event.stopPropagation();
    event.preventDefault();

    const touches = event.changedTouches;
    for (let i = 0; i < touches.length; i++) {
      const touch = touches[i];
      publicAPI.setEventPosition(touch.clientX, model.canvas.clientHeight - touch.clientY + 1, 0, touch.identifier);
      publicAPI.setPointerIndex(touch.identifier);
      publicAPI.startTouchEvent();
    }
  };

  publicAPI.handleTouchMove = (event) => {
    event.stopPropagation();
    event.preventDefault();

    const touches = event.changedTouches;
    for (let i = 0; i < touches.length; i++) {
      const touch = touches[i];
      publicAPI.setEventPosition(touch.clientX, model.canvas.clientHeight - touch.clientY + 1, 0, touch.identifier);
      publicAPI.setPointerIndex(touch.identifier);
      publicAPI.mouseMoveEvent();
    }
  };

  publicAPI.handleTouchEnd = (event) => {
    event.stopPropagation();
    event.preventDefault();

    const touches = event.changedTouches;
    for (let i = 0; i < touches.length; i++) {
      const touch = touches[i];
      publicAPI.setEventPosition(touch.clientX, model.canvas.clientHeight - touch.clientY + 1, 0, touch.identifier);
      publicAPI.setPointerIndex(touch.identifier);
      publicAPI.endTouchEvent();
    }
  };

  publicAPI.setView = (val) => {
    if (model.view === val) {
      return;
    }
    model.view = val;
    model.view.getRenderable().setInteractor(publicAPI);
    publicAPI.modified();
  };

  publicAPI.findPokedRenderer = (x, y) => {
    const rc = model.view.getRenderable().getRenderers();
    let interactiveren = null;
    let viewportren = null;
    let currentRenderer = null;

    rc.forEach((aren) => {
      if (model.view.isInViewport(x, y, aren) && aren.getInteractive()) {
        currentRenderer = aren;
      }

      if (interactiveren === null && aren.getInteractive()) {
        // Save this renderer in case we can't find one in the viewport that
        // is interactive.
        interactiveren = aren;
      }
      if (viewportren === null && model.view.isInViewport(x, y, aren)) {
        // Save this renderer in case we can't find one in the viewport that
        // is interactive.
        viewportren = aren;
      }
    }); // for all renderers

    // We must have a value.  If we found an interactive renderer before, that's
    // better than a non-interactive renderer.
    if (currentRenderer === null) {
      currentRenderer = interactiveren;
    }

    // We must have a value.  If we found a renderer that is in the viewport,
    // that is better than any old viewport (but not as good as an interactive
    // one).
    if (currentRenderer === null) {
      currentRenderer = viewportren;
    }

    // We must have a value - take anything.
    if (currentRenderer == null) {
      currentRenderer = rc[0];
    }

    return currentRenderer;
  };

  //----------------------------------------------------------------------
  publicAPI.render = () => {
    // if (model.renderWindow && model.enabled && model.enableRender) {
    //   model.renderWindow.render();
    // }
    if (model.view && model.enabled && model.enableRender) {
      model.view.traverseAllPasses();
    }
    // outside the above test so that third-party code can redirect
    // the render to the appropriate class
    publicAPI.invokeRenderEvent();
  };

  // create the generic Event methods
  eventsWeHandle.forEach((eventName) => {
    const lowerFirst = eventName.charAt(0).toLowerCase() + eventName.slice(1);
    publicAPI[`${lowerFirst}Event`] = () => {
      if (!model.enabled) {
        return;
      }
      publicAPI[`invoke${eventName}`]({ type: eventName });
    };
  });

  //------------------------------------------------------------------
  publicAPI.animationEvent = () => {
    if (!model.enabled) {
      return;
    }

    // are we translating multitouch into gestures?
    if (model.recognizeGestures && model.pointersDownCount > 1) {
      publicAPI.recognizeGesture('Animation');
    } else {
      publicAPI.invokeAnimation({ type: 'Animation' });
    }
  };

  //------------------------------------------------------------------
  publicAPI.mouseMoveEvent = () => {
    if (!model.enabled) {
      return;
    }

    // are we translating multitouch into gestures?
    if (model.recognizeGestures && model.pointersDownCount > 1) {
      publicAPI.recognizeGesture('MouseMove');
    } else {
      publicAPI.invokeMouseMove({ type: 'MouseMove' });
    }
  };

  // we know we are in multitouch now, so start recognizing
  publicAPI.recognizeGesture = (event) => {
    // more than two pointers we ignore
    if (model.pointersDownCount > 2) {
      return;
    }

    // store the initial positions
    if (event === 'LeftButtonPress') {
      model.pointersDown.forEach((value, key) => {
        model.startingEventPositions.set(key,
          model.eventPositions.get(key));
      });
      // we do not know what the gesture is yet
      model.currentGesture = 'Start';
      return;
    }

    // end the gesture if needed
    if (event === 'LeftButtonRelease') {
      if (model.currentGesture === 'Pinch') {
        model.interactorStyle.setAnimationStateOff();
        publicAPI.render();
        publicAPI.endPinchEvent();
      }
      if (model.currentGesture === 'Rotate') {
        model.interactorStyle.setAnimationStateOff();
        publicAPI.render();
        publicAPI.endRotateEvent();
      }
      if (model.currentGesture === 'Pan') {
        model.interactorStyle.setAnimationStateOff();
        publicAPI.render();
        publicAPI.endPanEvent();
      }
      model.currentGesture = 'Start';
      return;
    }

    // what are the two pointers we are working with
    let count = 0;
    const posVals = [];
    const startVals = [];
    model.pointersDown.forEach((value, key) => {
      posVals[count] = (model.animationRequest === null)
        ? model.eventPositions.get(key)
        : model.animationEventPositions.get(key);
      startVals[count] = model.startingEventPositions.get(key);
      count++;
    });

    // The meat of the algorithm
    // on move events we analyze them to determine what type
    // of movement it is and then deal with it.
    // calculate the distances
    const originalDistance = Math.sqrt(
        ((startVals[0].x - startVals[1].x) * (startVals[0].x - startVals[1].x))
        + ((startVals[0].y - startVals[1].y) * (startVals[0].y - startVals[1].y)));
    const newDistance = Math.sqrt(
        ((posVals[0].x - posVals[1].x) * (posVals[0].x - posVals[1].x))
        + ((posVals[0].y - posVals[1].y) * (posVals[0].y - posVals[1].y)));

    // calculate rotations
    let originalAngle =
      vtkMath.degreesFromRadians(Math.atan2(startVals[1].y - startVals[0].y,
                                         startVals[1].x - startVals[0].x));
    let newAngle =
      vtkMath.degreesFromRadians(Math.atan2(posVals[1].y - posVals[0].y,
                                          posVals[1].x - posVals[0].x));

    // angles are cyclic so watch for that, 1 and 359 are only 2 apart :)
    let angleDeviation = newAngle - originalAngle;
    newAngle = (newAngle + 180.0 >= 360.0 ? newAngle - 180.0 : newAngle + 180.0);
    originalAngle = (originalAngle + 180.0 >= 360.0 ? originalAngle - 180.0 : originalAngle + 180.0);
    if (Math.abs(newAngle - originalAngle) < Math.abs(angleDeviation)) {
      angleDeviation = newAngle - originalAngle;
    }

    // calculate the translations
    const trans = [];
    trans[0] = (posVals[0].x - startVals[0].x + posVals[1].x - startVals[1].x) / 2.0;
    trans[1] = (posVals[0].y - startVals[0].y + posVals[1].y - startVals[1].y) / 2.0;

    if (event === 'MouseMove') {
      // OK we want to
      // - immediately respond to the user
      // - allow the user to zoom without panning (saves focal point)
      // - allow the user to rotate without panning (saves focal point)

      // do we know what gesture we are doing yet? If not
      // see if we can figure it out
      if (model.currentGesture === 'Start') {
        // pinch is a move to/from the center point
        // rotate is a move along the circumference
        // pan is a move of the center point
        // compute the distance along each of these axes in pixels
        // the first to break thresh wins
        let thresh = 0.01 * Math.sqrt(
          (model.canvas.clientWidth * model.canvas.clientWidth)
          + (model.canvas.clientHeight * model.canvas.clientHeight));
        if (thresh < 15.0) {
          thresh = 15.0;
        }
        const pinchDistance = Math.abs(newDistance - originalDistance);
        const rotateDistance = newDistance * 3.1415926 * Math.abs(angleDeviation) / 360.0;
        const panDistance = Math.sqrt((trans[0] * trans[0]) + (trans[1] * trans[1]));
        if (pinchDistance > thresh
            && pinchDistance > rotateDistance
            && pinchDistance > panDistance) {
          model.currentGesture = 'Pinch';
          model.scale = 1.0;
          publicAPI.startPinchEvent();
          model.interactorStyle.setAnimationStateOn();
        } else if (rotateDistance > thresh
            && rotateDistance > panDistance) {
          model.currentGesture = 'Rotate';
          model.rotation = 0.0;
          publicAPI.startRotateEvent();
          model.interactorStyle.setAnimationStateOn();
        } else if (panDistance > thresh) {
          model.currentGesture = 'Pan';
          model.translation[0] = 0.0;
          model.translation[1] = 0.0;
          publicAPI.startPanEvent();
          model.interactorStyle.setAnimationStateOn();
        }
      }
    }

    if (event === 'Animation') {
      // if we have found a specific type of movement then
      // handle it
      if (model.currentGesture === 'Rotate') {
        publicAPI.setRotation(angleDeviation);
        publicAPI.rotateEvent();
      }

      if (model.currentGesture === 'Pinch') {
        publicAPI.setScale(newDistance / originalDistance);
        publicAPI.pinchEvent();
      }

      if (model.currentGesture === 'Pan') {
        publicAPI.setTranslation(trans);
        publicAPI.panEvent();
      }
    }
  };

  publicAPI.setScale = (scale) => {
    model.lastScale = model.scale;
    if (model.scale !== scale) {
      model.scale = scale;
      publicAPI.modified();
    }
  };

  publicAPI.setRotation = (rot) => {
    model.lastRotation = model.rotation;
    if (model.rotation !== rot) {
      model.rotation = rot;
      publicAPI.modified();
    }
  };

  publicAPI.setTranslation = (trans) => {
    model.lastTranslation = model.translation;
    if (model.translation !== trans) {
      model.translation = trans;
      publicAPI.modified();
    }
  };

  //------------------------------------------------------------------
  publicAPI.startTouchEvent = () => {
    if (!model.enabled) {
      return;
    }

    // are we translating multitouch into gestures?
    if (model.recognizeGestures) {
      if (!model.pointersDown.has(model.pointerIndex)) {
        model.pointersDown.set(model.pointerIndex, 1);
        model.pointersDownCount++;
      }
      // do we have multitouch
      if (model.pointersDownCount > 1) {
        // did we just transition to multitouch?
        if (model.pointersDownCount === 2) {
          publicAPI.invokeLeftButtonRelease({ type: 'LeftButtonRelease' });
        }
        // handle the gesture
        publicAPI.recognizeGesture('LeftButtonPress');
        return;
      }
    }

    publicAPI.invokeLeftButtonPress({ type: 'LeftButtonPress' });
  };

  //------------------------------------------------------------------
  publicAPI.endTouchEvent = () => {
    if (!model.enabled) {
      return;
    }

    // are we translating multitouch into gestures?
    if (model.recognizeGestures) {
      if (model.pointersDown.has(model.pointerIndex)) {
        // do we have multitouch
        if (model.pointersDownCount > 1) {
          // handle the gesture
          publicAPI.recognizeGesture('LeftButtonRelease');
        }
        model.pointersDown.delete(model.pointerIndex);
        if (model.startingEventPositions.get(model.pointerIndex)) {
          model.startingEventPositions.delete(model.pointerIndex);
        }
        if (model.eventPositions.get(model.pointerIndex)) {
          model.eventPositions.delete(model.pointerIndex);
        }
        if (model.lastEventPositions.get(model.pointerIndex)) {
          model.lastEventPositions.delete(model.pointerIndex);
        }
        model.pointersDownCount--;
        publicAPI.invokeLeftButtonRelease({ type: 'LeftButtonRelease' });
      }
    } else {
      publicAPI.invokeLeftButtonRelease({ type: 'LeftButtonRelease' });
    }
  };
}

// ----------------------------------------------------------------------------
// Object factory
// ----------------------------------------------------------------------------

const DEFAULT_VALUES = {
  startingEventPositions: null,
  pointersDown: null,
  pointersDownCount: 0,
  pointerIndex: 0,
  renderWindow: null,
  interactorStyle: null,
  picker: null,
  pickingManager: null,
  initialized: false,
  enabled: false,
  enableRender: true,
  lightFollowCamera: true,
  desiredUpdateRate: 30.0,
  stillUpdateRate: 2.0,
  shiftKey: false,
  altKey: false,
  controlKey: false,
  keyCode: 0,
  key: '',
  canvas: null,
  view: null,
  recognizeGestures: true,
  currentGesture: 'Start',
  scale: 1.0,
  lastScale: 1.0,
  translation: [],
  lastTranslation: [],
  rotation: 0.0,
  lastRotation: 0.0,
  animationRequest: null,
};

// ----------------------------------------------------------------------------

export function extend(publicAPI, model, initialValues = {}) {
  Object.assign(model, DEFAULT_VALUES, initialValues);

  // Internal objects initialization
  model.eventPositions = new Map();
  model.lastEventPositions = new Map();
  model.pointersDown = new Map();
  model.startingEventPositions = new Map();
  model.animationEventPositions = new Map();
  model.lastAnimationEventPositions = new Map();

  // Object methods
  macro.obj(publicAPI, model);

  macro.event(publicAPI, model, 'RenderEvent');
  eventsWeHandle.forEach(eventName =>
    macro.event(publicAPI, model, eventName));

  // Create get-only macros
  macro.get(publicAPI, model, [
    'initialized',
    'enabled',
    'enableRender',
    'scale',
    'lastScale',
    'rotation',
    'lastRotation',
    'interactorStyle',
    'recentFrameTime',
    'view',
  ]);

  // Create get-set macros
  macro.setGet(publicAPI, model, [
    'pointerIndex',
    'lightFollowCamera',
    'enabled',
    'shiftKey',
    'controlKey',
    'altKey',
    'keyCode',
    'recognizeGestures',
    'desiredUpdateRate',
    'stillUpdateRate',
    'key',
  ]);

  macro.getArray(publicAPI, model, [
    'translation',
    'lastTranslation',
  ]);

  // For more macro methods, see "Sources/macro.js"

  // Object specific methods
  vtkRenderWindowInteractor(publicAPI, model);

  publicAPI.setInteractorStyle(vtkInteractorStyleTrackballCamera.newInstance());
}

// ----------------------------------------------------------------------------

export const newInstance = macro.newInstance(extend, 'vtkRenderWindowInteractor');

// ----------------------------------------------------------------------------

export default Object.assign({ newInstance, extend });