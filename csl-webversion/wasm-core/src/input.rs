// Input management - Keyboard, mouse, touch

use wasm_bindgen::prelude::*;
use std::collections::HashMap;
use std::rc::Rc;
use std::cell::RefCell;

/// Input state for a single frame
#[derive(Debug, Clone)]
pub struct InputState {
    pub forward: bool,
    pub backward: bool,
    pub left: bool,
    pub right: bool,
    pub jump: bool,
    pub sneak: bool,
    pub sprint: bool,
    pub mouse_dx: f32,
    pub mouse_dy: f32,
    pub mouse_buttons: [bool; 3],
    pub keys: HashMap<String, bool>,
}

impl InputState {
    pub fn new() -> Self {
        InputState {
            forward: false,
            backward: false,
            left: false,
            right: false,
            jump: false,
            sneak: false,
            sprint: false,
            mouse_dx: 0.0,
            mouse_dy: 0.0,
            mouse_buttons: [false; 3],
            keys: HashMap::new(),
        }
    }
}

/// Input manager - attaches to canvas and tracks input
pub struct InputManager {
    state: InputState,
    key_map: Rc<RefCell<HashMap<String, bool>>>,
    mouse_locked: bool,
    mouse_dx: Rc<RefCell<f32>>,
    mouse_dy: Rc<RefCell<f32>>,
    // Keep closures alive
    _keydown_closure: Option<Closure<dyn FnMut(web_sys::KeyboardEvent)>>,
    _keyup_closure: Option<Closure<dyn FnMut(web_sys::KeyboardEvent)>>,
    _mousemove_closure: Option<Closure<dyn FnMut(web_sys::MouseEvent)>>,
    _click_closure: Option<Closure<dyn FnMut(web_sys::MouseEvent)>>,
    _contextmenu_closure: Option<Closure<dyn FnMut(web_sys::MouseEvent)>>,
}

impl InputManager {
    pub fn new() -> Self {
        InputManager {
            state: InputState::new(),
            key_map: Rc::new(RefCell::new(HashMap::new())),
            mouse_locked: false,
            mouse_dx: Rc::new(RefCell::new(0.0)),
            mouse_dy: Rc::new(RefCell::new(0.0)),
            _keydown_closure: None,
            _keyup_closure: None,
            _mousemove_closure: None,
            _click_closure: None,
            _contextmenu_closure: None,
        }
    }

    /// Attach event listeners to the canvas
    pub fn attach(&mut self, canvas_id: &str) -> Result<(), JsValue> {
        let window = web_sys::window().unwrap();
        let document = window.document().unwrap();
        let canvas = document.get_element_by_id(canvas_id)
            .ok_or_else(|| JsValue::from_str("Canvas not found"))?;

        // Keyboard events with Rc<RefCell<>> for proper interior mutability
        let key_map = self.key_map.clone();
        let key_map2 = key_map.clone();
        
        let keydown = Closure::new(Box::new(move |e: web_sys::KeyboardEvent| {
            key_map.borrow_mut().insert(e.key().to_lowercase(), true);
            e.prevent_default();
        }) as Box<dyn FnMut(_)>);
        
        let keyup = Closure::new(Box::new(move |e: web_sys::KeyboardEvent| {
            key_map2.borrow_mut().insert(e.key().to_lowercase(), false);
            e.prevent_default();
        }) as Box<dyn FnMut(_)>);

        document.add_event_listener_with_callback("keydown", keydown.as_ref().unchecked_ref())?;
        document.add_event_listener_with_callback("keyup", keyup.as_ref().unchecked_ref())?;

        // Mouse move events
        let mdx = self.mouse_dx.clone();
        let mdy = self.mouse_dy.clone();
        let mousemove = Closure::new(Box::new(move |e: web_sys::MouseEvent| {
            *mdx.borrow_mut() += e.movement_x() as f32;
            *mdy.borrow_mut() += e.movement_y() as f32;
        }) as Box<dyn FnMut(_)>);

        canvas.add_event_listener_with_callback("mousemove", mousemove.as_ref().unchecked_ref())?;

        // Pointer lock on click
        let canvas_clone = canvas.clone();
        let click = Closure::new(Box::new(move |_: web_sys::MouseEvent| {
            canvas_clone.request_pointer_lock();
        }) as Box<dyn FnMut(_)>);

        canvas.add_event_listener_with_callback("click", click.as_ref().unchecked_ref())?;

        // Prevent context menu
        let canvas_clone2 = canvas.clone();
        let contextmenu = Closure::new(Box::new(move |e: web_sys::MouseEvent| {
            e.prevent_default();
        }) as Box<dyn FnMut(_)>);

        canvas.add_event_listener_with_callback("contextmenu", contextmenu.as_ref().unchecked_ref())?;

        // Store closures to prevent them from being dropped
        self._keydown_closure = Some(keydown);
        self._keyup_closure = Some(keyup);
        self._mousemove_closure = Some(mousemove);
        self._click_closure = Some(click);
        self._contextmenu_closure = Some(contextmenu);

        Ok(())
    }

    /// Poll current input state
    pub fn poll(&mut self) -> InputState {
        let mut state = InputState::new();
        let key_map = self.key_map.borrow();
        
        // Map keys to actions
        state.forward = *key_map.get("w").unwrap_or(&false) || *key_map.get("ArrowUp").unwrap_or(&false);
        state.backward = *key_map.get("s").unwrap_or(&false) || *key_map.get("ArrowDown").unwrap_or(&false);
        state.left = *key_map.get("a").unwrap_or(&false) || *key_map.get("ArrowLeft").unwrap_or(&false);
        state.right = *key_map.get("d").unwrap_or(&false) || *key_map.get("ArrowRight").unwrap_or(&false);
        state.jump = *key_map.get(" ").unwrap_or(&false);
        state.sneak = *key_map.get("Shift").unwrap_or(&false);
        state.sprint = *key_map.get("Control").unwrap_or(&false);
        
        // Mouse delta (reset after reading)
        state.mouse_dx = *self.mouse_dx.borrow();
        state.mouse_dy = *self.mouse_dy.borrow();
        *self.mouse_dx.borrow_mut() = 0.0;
        *self.mouse_dy.borrow_mut() = 0.0;
        
        state
    }
}