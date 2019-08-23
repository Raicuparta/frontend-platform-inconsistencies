You're a North Korean engineer who's been selected to develop a new government project. It's an HTML form, which North Korean political leaders will fill in for `[REDACTED]` purposes.

One of the fields requires the user to select the title by which they prefer to be addressed. [Since the list can get pretty long](https://en.wikipedia.org/wiki/List_of_Kim_Jong-il's_titles), you decide to go for your good old `<select>` element. It looks like this:

Windows (Chrome) | macOS (Safari)
:-------------------------:|:-------------------------:
<img src="https://i.imgur.com/WCmcByj.gif" width=250px> | <img src="https://i.imgur.com/VGEO2a1.gif" width=250px>

Nothing out of the ordinary, perfectly acceptable in most cases.

You know that **`<select>` has that kind of "search" that jumps to the items as you type**. But you're not sure if the *Great Leader* is aware of this. You feel like this is not too big of a deal, as long as the list is in alphabetical order.

What about mobile?

Android (Chrome) | iOS (Safari)
:-------------------------:|:-------------------------:
<img src="https://i.imgur.com/LPYPNZE.gif" width=250px> | <img src="https://i.imgur.com/H045TT6.gif" width=250px>  

Android tries to use as much of the screen as possible, covering the address bar. On iOS, the small number of visible items makes for an awful experience with larger lists. Both of them lack a way to search or filter list items.

Will the *Father of the Nation* look the other way? Not wanting to take any chances, you take this matter into your own hands. You want something that can be filtered on mobile, and makes better use of screen real estate. 

On desktop platforms this is not too hard to achieve: just a custom dropdown with a text input for filtering. For mobile, you'll need something different. Let's focus on the mobile version, and presume that you'll have some way to pick the correct implementation depending on the platform.

This is your plan for mobile:

<img src="https://i.imgur.com/xmPAh3U.png" width=250px>

A full-screen modal with a fixed text input at the top for filtering, and a scrollable list of items below it. Your first instinct tells you the implementation should go like this:

```html
<button onclick="openModal()">Select a title</button>
<div class="modal" id="modal">
  <div class="modal-header">
    <input type="text" id="filter-input">
    <button onclick="closeModal()">X</button>
  </div>
  <div class="modal-body">
    <button>Item 1</button>
    <button>Item 2</button>
    <!-- remaining items... -->
  </div>
</div>
```
```css
.modal {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  flex-direction: column;
}

.modal.show {
  display: flex;
}

.modal-body {
  flex: 1;
  overflow-y: auto;
}
```
```javascript
const modal = document.getElementById('modal')
const filterInput = document.getElementById('filter-input')

function openModal() {
  modal.classList.add('show')
  filterInput.focus()
}

function closeModal() {
  modal.classList.remove('show')
}
```
The important bits:
* `position: fixed` to fix the modal to the screen;
* `height: 100vh` to make the height 100% of viewport's;
* Modal divided in two parts: header and body;
* Header's height defined by its children, no need to set it explicitly;
* Body fills the remaining height with `flex: 1`;
* `scrolly-y: auto` in the body to make it scrollable when the list doesn't fit. 

It looks like this:

Android (Chrome) | iOS (Safari)
:-------------------------:|:-------------------------:
<img src="https://i.imgur.com/yk0arYW.gif" width=250px> | <img src="https://i.imgur.com/ng7c3ZU.gif" width=250px>

Looks good on iOS, but **on Android the last items are being cut off**. Why?

Some mobile browsers hide the address bar when the user scrolls down. This changes the visible viewport height, but not the meaning of `100vh`. So `100vh` actually a bit taller than what is initially visible. 

Your modal has `position: fixed` , so you don't need to use `vh` units. `height: 100%` will fill the available height correctly:

<img src="https://i.imgur.com/LBH8Mq6.gif" width=250px>

Neat! This is already an improvement from the native versions of `<select>` on mobile. Now you need to implement the filter behavior.

You're pretty sure that your *Guiding Sun Ray* wouldn't want to go through the trouble of having to touch the filter input every time after opening the modal. So you should `focus()` the filter input as soon as the modal opens. This way, the keyboard pops up and the user can start typing right away. Let's see how it looks:

Android (Chrome) | iOS (Safari)
:-------------------------:|:-------------------------:
<img src="https://i.imgur.com/gGFGVMK.gif" width=250px> | <img src="https://i.imgur.com/Ok9z6as.gif" width=250px>

This time everything looks fine on Android. On iOS, the modal header is scrolled out of bounds once you try to scroll the list. What's going on?

iOS without Keyboard | iOS with Keyboard
:-------------------------:|:-------------------------:
<img src="https://i.imgur.com/LLNaUMD.png" width=250px> | <img src="https://i.imgur.com/xitpo2n.png" width=250px>

When you filter by "Leader", the list becomes small enough to fit the screen without scrolling, but only if the keyboard isn't visible. On Android, opening the keyboard shrinks the viewport down to the visible area. But **on iOS, the viewport size remains unchanged; it is just being covered by the keyboard**. iOS lets you scroll the page while the keyboard is open, revealing that missing portion of the page. This behavior can break `position: fixed` elements like yours.

To make matters worse, there's no way to know how tall the keyboard will be, or if it is there at all (the user can be using a hardware keyboard). No clever CSS trick can save you this time.

So you need to have a scrollable list, where all the items are accessible, without knowing if an arbitrary portion of the lower part of screen is visible or not. This is your workaround:

<img src="https://i.imgur.com/VZPJge6.gif" width=250px>

You add a spacer at the bottom of the list (highlighted in green for visibility). The height of this spacer is the height of the list area, minus one element. This way, it's always possible to scroll all the way to the bottom, bringing the last element to the very top of the list.

There are still ways to make the modal scroll outside the viewport, and you need to patch them.

One way is by swiping on any non-scrollable elements currently visible. In your case, that's the modal header. You can't just disable all pointer events through CSS, since you need the inner elements (filter input and close button) to still be usable. The solution is to disable scrolling on `touchmove` events:

```javascript
const header = document.getElementById('modal-header')

header.addEventListener('touchmove', event => {
  event.preventDefault()
})
```

The default reaction to `touchmove` is scrolling, so blocking that with `preventDefault()` will make it unscrollable.

<hr>

Now let's take a small detour. I've been writing these examples in HTML + JavaScript to make the article a bit more universal. But I came across this spiral of workarounds while developing in React. This is how I define my event handler in React:

```jsx
function handleTouchMove(event) {
  event.preventDefault()
}

// …

<Element onTouchMove={handleTouchMove} />

```

The expectation might be that in plain JavaScript, this would translate to something like this:

```javascript
const element = document.getElementById('element')

element.addEventListener('touchmove', event => {
  // call the callback for this element
})
```

But what happens is closer to this (not real code):

```javascript
document.addEventListener('touchmove', event => {
  const element = React.getElementFromEvent(event)
  
  // call the callback for this element
})
```

React binds the events at the document level, instead of binding them at the level of each individual node. Here is what happens when I try to `preventDefault()` touch events in React:

<img src="https://i.imgur.com/LJvSU1c.png">

The browser blocks it. [This was introduced with a Chrome update that made events be "passive" by default](https://github.com/facebook/react/issues/9809#issuecomment-414072263), and those can't be blocked with `preventDefault` at the document level. The solution is to bind the event manually at the node level, instead of doing it through React's event system:

```jsx
ref = React.createRef();

componentDidMount() {
  ref.addEventListener('touchmove', handleTouchMove)
}

function handleTouchMove (event) {
  event.preventDefault()
}

// …

<Element ref={ref} onTouchMove={handleTouchMove} />
```

So yes, particularly in React, this workaround requires a workaround.

As I write this, [React's event system is being rewritten](https://github.com/facebook/react/issues/15257), so the problem may no longer exist by the time you read this article.

Now back to *your* problem.

<hr>

There is one more way to scroll your hopes and dreams away. If the user insists on scrolling when there are no more items to show, the viewport can be scrolled up. None of this fazes you anymore, you just jam another workaround in there:

```javascript
const modalBody = document.getElementById('modal-body')

menuScroll = () => {
  if (modalBody.scrollHeight - modalBody.scrollTop === modalBody.clientHeight) {
    modalBody.scrollTop -= 1
  }
}

modalBody.addEventListener('scroll', menuScroll)
```

You push the list's scroll position one pixel away from the edge when the scroll reaches the bottom. This way, the outer scroll is never triggered.

The solution is already pretty solid, but there is one more thing you'd like to improve. The modal suddenly covering the screen might be a bit jarring. What if *His Excellency* isn't paying attention and gets spooked? Who will take care of your kids?

A simple transition animation could make it easier to follow. Perhaps you could slide the modal from the bottom of the screen? Easy to achieve with CSS transitions:

```css
.modal {
  /* ... */

  display: flex;
  top: 100vh;
  transition: top 500ms;
}

.modal.show {
  top: 0;
}
```
Now, instead of initializing your modal with `display: none` and `top: 0`, you start it already with `display: flex`, but pushed outside the viewport with `top: 100vh`. When the modal is set to visible, it will scroll smoothly to the top of the screen. Let's see the results:

Android (Chrome) | iOS (Safari)
:-------------------------:|:-------------------------:
<img src="https://i.imgur.com/nEOQ46m.gif" width=250px> | <img src="https://i.imgur.com/spsjQGw.gif" width=250px>

So close! Android is behaving well again, while iOS blasts the modal to outer space as soon as it is visible. It seems like toggling the keyboard while the modal is being animated isn't a good idea. You feel pretty confident that showing the keyboard only after the animation is done should fix it:

```javascript
function openModal() {
  modal.classList.add('show')

  // new
  setTimeout(() => {
    filterInput.focus()
  }, 500)
}
```
Simple enough. You wait for 500ms, the same as the transition duration, and only then you `focus()` the input to make the keyboard pop up. You tell yourself that you'll clean this up later, maybe using events or some fancy library, instead of relying on the values being consistent between JS and CSS. But you know it won't happen. The result:

Android | iOS
:-------------------------:|:-------------------------:
<img src="https://i.imgur.com/FbsjydM.gif" width=250px> | <img src="https://i.imgur.com/ljUJLin.gif" width=250px>

iOS doesn't seem to be focusing the input at all. Of course, it couldn't be that easy. **iOS only allows `focus` events to happen as a direct result of a user interaction**, and `setTimeout` isn't that. Your workaround is to turn the "Select a title" button into a text input:

```html
<input onfocus="openModal()" readonly=true placeholder="Select a title">
```

The `readonly` hides the caret and makes sure the user can't type anything into this new input during the transition. This way, iOS will show the keyboard based on the first `focus` event, allowing you to change the focus to the second input after the transition is done.

<img src="https://i.imgur.com/ZXElGGp.gif" width=250px>

And it works! You're finally done. You feel proud of your work, knowing your family will live at least another couple months.

<hr>

[Find the full code for the modal here](https://github.com/Raicuparta/frontend-platform-inconsistencies/tree/master/page)
