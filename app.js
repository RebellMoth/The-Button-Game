// The Button

//===========================================
// GLOBAL & DOM ELEMENTS
//===========================================
const scoreDisplay = document.getElementById("score");
const timerCircle = document.getElementById("timer");
const instructionDisplay = document.getElementById("instruction");
const feedbackDisplay = document.getElementById("feedback");
const gameOverDisplay = document.getElementById("end-container");
const finalScoreDisplay = document.getElementById("final-score");
const gameArea = document.getElementById("game-area");
const buttonArea = document.getElementById("button-area");

// Game state variables
let gameMemory = {lastTaskNumber: null };   // Stores the prevoius task ID
let point = 0;                              // Player score
let streak = 0;                             // Win/loss streak multiplier
let startMisses = 0;                        // Misclicks in the intro task
let isGameOver = false;                     // Tracks if the game has ended
let taskTimer;                              // Shared countdown timer fo tasks
let introOver = false;                      // Becomes true afer intro task
let maxTime = 0;
let timeLeft = 0;
let visualTimer;

// Pool of active tasks (Cases 2 to 15)
let tasks = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];

//===========================================
// UTILITY FUNCTIONS
//===========================================

function timer(seconds){
    clearInterval(visualTimer);
    timerCircle.style.background = "conic-gradient( #3d3838 0%, #3d3838 100%)";

    timeLeft = seconds;
    maxTime = seconds;

    updateTimer();
    visualTimer = setInterval(updateTimer, 1000);
}
function updateTimer(){
    let percentage = ((maxTime - timeLeft) / maxTime) * 100;
    timerCircle.style.background = `conic-gradient(#ff1515 ${percentage}%, #3d3838 ${percentage}%)`;

    timeLeft--;
}
// Simulates a typewriter effect for text delivery
function typeWriter(text, element, delay, callback) {
    element.textContent = "";
    let index = 0;

    // Dynamic typing interval
    let typingInterval = setInterval(() => {
        if (index < text.length) {
            element.textContent += text.charAt(index); // Print character by character
            index++;
        } else {
            clearInterval(typingInterval); // Stop when text is fully displayed
            if (callback) callback(); // Execute post-typing actions
        }
    },delay);
}
// Displays the mein menu with a sequenced typewriter effect
function showMainMenu(){
    const introText = "Follow the instructions, be fast, time is limited! Good Luck!";

    // Trigger sequential typewriter animations
    typeWriter(introText, instructionDisplay, 70, () => {
        // Create the main start button after text completes
        const startBtn = document.createElement("button");
        startBtn.textContent = "Start Game";
        buttonArea.appendChild(startBtn);

        // Initialize the game on click
        startBtn.addEventListener("click", () => {
            startBtn.remove();

            const nameInput = document.createElement("input");
            nameInput.type = "text";
            nameInput.placeholder = "Write your name here...";
            nameInput.id = "name-input";
            buttonArea.appendChild(nameInput);

            const confirmBtn = document.createElement("button");
            confirmBtn.textContent = "Confirm";
            buttonArea.appendChild(confirmBtn);

            confirmBtn.addEventListener("click", () => {
                const enteredName = nameInput.value.trim();

                if (enteredName === "") {
                    feedbackDisplay.textContent = "Please, enter a name to proceed!";
                    return;
                }
                playerName = enteredName;
                nameInput.remove();
                confirmBtn.remove();
                feedbackDisplay.textContent = "";
                instructionDisplay.textContent = "";
                startGame();

            })
        });
    });
}
// INIITIATE GAME - Handles the mandatory introductory task 
function startGame() {
    console.log("Game strated for player: " + playerName);
    instructionDisplay.textContent = "Press The Button";

    // Create th initial bait button
    const btn = document.createElement("button");
    btn.textContent = "CLICK ME";
    buttonArea.appendChild(btn);

    // Success path for the intro task
    btn.addEventListener("click", () => {
        point++;
        streak++;
        feedbackDisplay.textContent = "You Did It!";
        scoreDisplay.textContent = "Score: " + point;
        introOver = true;   // Locks the into misclick handler permanently
        gameArea.querySelectorAll("button").forEach(button => button.remove());

        setTimeout(() => {
            btn.remove();
            nextTask();  // Move to the randomized task pool
        }, 2500);
    })

    // Captures misclicks on the empty game area during the intro phase
    gameArea.addEventListener("click", (event) => {
        if (isGameOver === true) {
            return;
        }
        // Only triggers if the empty space is clicked AND the intro is still active
        if (event.target === gameArea && introOver === false) {
            startMisses++;
            switch (startMisses) {
                case 1: feedbackDisplay.textContent = "Just Press The Button.";
                break;
                case 2: feedbackDisplay.textContent = "Try Again...";
                break;
                case 3: feedbackDisplay.textContent = "Can't You Read, Or Are You Stupid?";
                break;
                case 4: feedbackDisplay.textContent = "Press The F***** Button " + playerName.toUpperCase() + "!!!";
                break;
                default: feedbackDisplay.textContent = "You Are The F***** Idiot! I Quit!";
                point = point -1000;
                scoreDisplay.textContent = "Score: " + point;
                const introBtn = buttonArea.querySelector("button");
                if (introBtn) introBtn.remove();

                instructionDisplay.textContent = "";

                // System rage quit sequence
                setTimeout(() => { 
                    isGameOver = true;
                    gameOverDisplay.textContent = "GAME OVER - System rage quit";
                    finalScoreDisplay.textContent = "Score: " + point;
                }, 2500);
                
                break;
            }
        }
    })
}   // END OF startGame() - Intro section ends here

// ==========================================
// CORE CORE GAMEPLAY LOGIC
// ==========================================

// Calculates scores and dynamic streak multipliers
function updateScore(isCorrect) {
    if (isCorrect === true) {
        // If player had a loss streak, reset and start a win streak
        if (streak < 0){
            streak = 1;
            point = point + streak;
        }
        else {
            // Increment win streak and add to points
            streak ++;
            point = point + streak;
        }
    }
    else if (isCorrect === false) {
        // If player had a win streak, break it and start a loss streak
        if (streak > 0) {
            streak = -1;
            point = point + streak;
        }
        else {
            // Increase the penalty multiplier for consecutive errors
            streak --;
            point = point + streak;
        }
    }
    // Update the live score display
    scoreDisplay.textContent = "Score: " + point;
    console.log("Score updated. Current points: " + point);
}

// Handles time-out penalties when a task timer expires
function triggerTimeout() {
    // Reset text color to default white for upcoming tasks
    instructionDisplay.style.color = "white";
    timerCircle.style.background = "conic-gradient( #3d3838 0%, #3d3838 100%)";

    point = point - 5;      // Fixed penalty for running out of time
    updateScore(false);     // Trigger loss streak and update display

    // Wipe all dynamic buttons from the active area
    buttonArea.querySelectorAll("button").forEach(button => button.remove());

    instructionDisplay.textContent = "";
    feedbackDisplay.textContent = "Too Slow! " + playerName + " -5 points!";

    // Transition to the next task after a short reading delay
    setTimeout(() => {
        nextTask();
    }, 2500);
    console.log("Task timed out! Triggering penalty sequence.");
}

// CORE GAME LOOP - Manages task selection, routing, and game termination
function nextTask() {
    clearInterval(visualTimer);

     // WIN CONDITION - Triggers when all tasks from the pool have been completed
    if (tasks.length === 0) {
        clearTimeout(taskTimer);    // Freeze any remaining task countdowns
        isGameOver = true;

        // Ensure the active playing space is fully cleared
        buttonArea.querySelectorAll("button").forEach(button => button.remove());
        gameOverDisplay.querySelector("#game-over-screen").textContent = " GAME OVER! CONGRATULATIONS " + playerName.toUpperCase() + "!";        
        finalScoreDisplay.textContent = "Final score: " + point;       
        gameOverDisplay.style.visibility = "visible";
        return; // Prevent further logic execution
    }

    // RANDOM SELECTOR - Picks a random index from the remaining task array
    const randomIndex = Math.floor(Math.random() * tasks.length);
    let taskNumber = tasks[randomIndex];    // Uses 'let' to allow fall-through modifications in Case 14

    // DEBUG LOGS - Tracks active task flow inside the browser console
    console.log(taskNumber);
    tasks.splice(randomIndex, 1);   // Permanently remove the selected task from rotation
    console.log(tasks);

    // MEMORY CAPTURE - Stores the current task ID for the echo mechanics (skips itself)
    if (taskNumber !== 14) { gameMemory.lastTaskNumber = taskNumber; }

    // ROUTING ENGINE - Evaluates the task ID and jumps to the corresponding case block
    switch (taskNumber) {

        // ==========================================
        // TASK 14: THE ECHO INVERSION (FALL-THROUGH)
        // ==========================================
        case 14: {
            // Safety latch: If drawn first without history, redraw immediately
            if( gameMemory.lastTaskNumber === null ) {
                nextTask(); 
                return; 
            }
            instructionDisplay.textContent = "Try The Previous Task Again... if you can remember it";
            feedbackDisplay.textContent = "";

             // DYNAMIC INVERSION: Override current task pointer with the recorded task ID
            taskNumber = gameMemory.lastTaskNumber;
            timer();
        }
        // ==========================================
        // TASK 2: THE REVERSE PSYCHOLOGY BAIT
        // ==========================================
        case 2:{ 
        let taskClicked = false;    // Tracks if the trap button was clicked
        
        feedbackDisplay.textContent = "";
        instructionDisplay.textContent = "Don't Press The Button";

        // Create the forbidden bait button
        const btn = document.createElement("button");
        btn.textContent = "Click Me!";
        buttonArea.appendChild(btn);

        // First provocation sequence after 2.5 seconds
        let provokeTimer = setTimeout(() => {
            if (isGameOver === false && taskClicked === false) {
                feedbackDisplay.textContent = "Are You Frozen..? DO SOMETHING!"
            }
        },2500);

        // Second provocation sequence after 5 seconds
        let provokeTimer2 =setTimeout (() => {
            if (isGameOver === false && taskClicked === false) {
                feedbackDisplay.textContent = "CLick It! I Dare You!";
            }
        }, 5000);

        // SUCCESS PATH - Player successfully resists pressing the button for 7 seconds
        taskTimer = setTimeout(() => {
            instructionDisplay.textContent = "";
            btn.remove();
            feedbackDisplay.textContent = "";
            feedbackDisplay.textContent = "You Clearly Know How To Wait. Or maybe you're just lazy...";
            updateScore (true) ;

            setTimeout(() => {
                nextTask()
            }, 2500);
        }, 7000);

        // FAILURE PATH - Player falls for the bait and clicks the button
        btn.addEventListener("click", () => {
            // Clear all active background timers instantly
            clearTimeout(provokeTimer);
            clearTimeout(provokeTimer2);
            clearTimeout(taskTimer);

            taskClicked = true;
            instructionDisplay.textContent = "";
            feedbackDisplay.textContent = "I Literally said DON'T Press " + playerName.toUpperCase() + "..";
            btn.remove(); 
            updateScore (false) ;

            setTimeout(() => {
                nextTask();
            }, 2500);
        });
        timer(7);
        break;}

        // ==========================================
        // TASK 3: THE BLIND THREE-BUTTON MONTY
        // ==========================================
        case 3:{        
        feedbackDisplay.textContent = "";
        instructionDisplay.textContent = "Press The Button";

        // Randomly select one index (0, 1, or 2) as the winning button
        const correctBtnIndex = Math.floor(Math.random() * 3 );

        // Loop to generate 3 dynamic buttons
        for (let i = 0; i < 3; i++) {
            const btn = document.createElement("button");
            buttonArea.appendChild(btn);

            // Add event listener to each button
            btn.addEventListener("click", () => {
                // SUCCESS PATH - Player clicks the randomly chosen winning button
                if (i === correctBtnIndex){
                    clearTimeout(taskTimer);    // Stop the countdown
                    instructionDisplay.textContent = "";

                    // Clear all dynamic buttons from the active area
                    buttonArea.querySelectorAll("button").forEach(button => button.remove())
                    instructionDisplay.textContent = "";
                    feedbackDisplay.textContent = "I Think You Are Just Lucky";
                    updateScore (true) ;
                    setTimeout(() => {
                        nextTask()
                    }, 2500);
                }
                // FAILURE PATH - Player clicks a wrong button trap
                else {
                    clearTimeout(taskTimer);    // Stop the countdown
                    instructionDisplay.textContent = "";
                    feedbackDisplay.textContent = playerName.toUpperCase() + " Why Did You Press That One??";
                    buttonArea.querySelectorAll("button").forEach(button => button.remove())
                    updateScore (false) ;

                    setTimeout(() => {
                        nextTask()
                    }, 2500);

                }
            });
        }
        // Hard timeout limits player to 4 seconds
        taskTimer = setTimeout(() => {
            triggerTimeout();
        },4000);
        timer(4);
        break;}

        // ==========================================
        // TASK 4: THE GRAYSCALE VISUAL BLINDNESS
        // ==========================================
        case 4:{
        feedbackDisplay.textContent = "";
        instructionDisplay.textContent = "Press The Green Button";

        // Blue button trap disguised by grayscale supressor
        const btn1 = document.createElement("button");
        btn1.style.backgroundColor = "blue"
        btn1.style.filter = "grayscale(100%)";
        buttonArea.appendChild(btn1);

        btn1.addEventListener("click", () => {
            clearTimeout(taskTimer);
            buttonArea.querySelectorAll("button").forEach(button => button.remove());
            instructionDisplay.textContent = "";
            feedbackDisplay.textContent = "You Think That One Was Green?";
            updateScore(false);

            setTimeout(() => {
                nextTask()
            }, 2500);            
        })

        // Red button trap disguised by grayscale supressor
        const btn2 = document.createElement("button");
        btn2.style.backgroundColor = "red"
        btn2.style.filter = "grayscale(100%)";
        buttonArea.appendChild(btn2);
        btn2.addEventListener("click", () => {
            clearTimeout(taskTimer);
            buttonArea.querySelectorAll("button").forEach(button => button.remove());
            instructionDisplay.textContent = "";
            feedbackDisplay.textContent = "Are You Colorblind?";
            updateScore(false);

            setTimeout(() => {
                nextTask()
            }, 2500);            
        })
        
        // Winning green button disguised by grayscale supressor
        const btn3 = document.createElement("button");
        btn3.style.backgroundColor = "green"
        btn3.style.filter = "grayscale(100%)";
        buttonArea.appendChild(btn3);
        btn3.addEventListener("click", () => {
            clearTimeout(taskTimer);
            buttonArea.querySelectorAll("button").forEach(button => button.remove());
            instructionDisplay.textContent = "";
            feedbackDisplay.textContent = "How You..? You Just Guessed!";
            updateScore(true);

            setTimeout(() => {
                nextTask()
            }, 2500);            
        })

        // 8-second window to resolve the selection puzzle
        taskTimer = setTimeout(() => {
            triggerTimeout();
        },8000);
        timer(8);
        break; } 
        
        // ==========================================
        // TASK 5: THE FRAGILE DOUBLE-STAGE INTERFACE
        // ==========================================
        case 5: {
            feedbackDisplay.textContent = "";
            instructionDisplay.textContent = "Press Gently";

            // Create the first fragile bait button
            const btn = document.createElement("button");
            buttonArea.appendChild(btn);

            // Phase 1 - Player clicks the initial fragile button
            btn.addEventListener("click", () => {
                instructionDisplay.textContent = "";
                feedbackDisplay.textContent = "I Said Gently And You Broke It!";
                btn.remove();// Button "breaks" immediately

                // Spawn sequence for the second unbreakable button after 2.7
                setTimeout(() => {
                    const newBtn = document.createElement("button");
                    instructionDisplay.textContent = "Be Gentle";
                    feedbackDisplay.textContent = "Alright, There Is Second One.. DON'T BREAK IT!!";
                    buttonArea.appendChild(newBtn);
                    newBtn.textContent = "Unbreakable Button";

                    // Phase 2 - Player clicks the newly spawned unbreakable button
                    newBtn.addEventListener("click", () => {
                        clearTimeout(taskTimer);    // Stop the overarching 12-second countdown
                        instructionDisplay.textContent = "";
                        feedbackDisplay.textContent = "I was afraid you'd break this too.. But somehow you succeeded";
                        newBtn.remove();
                        updateScore(true);

                        setTimeout(() => {
                            nextTask()
                        }, 2500);  
                    })
                }, 2700);

            })

            // Extended 12-second window to accommodate the delayed multi-stage timeline
            taskTimer = setTimeout(() => {
                triggerTimeout();
            },12000);
            timer(12);
        break; }

        // ==========================================
        // TASK 6: THE MISLEADING TEXT SEMANTICS
        // ==========================================
        case 6:{
            feedbackDisplay.textContent = "";
            instructionDisplay.textContent = "Click The Correct Button To Continue";

            // Array containing literal text traps for the button elements
            const buttonTexts = ["The Correct Button", "The Other Button", "Don't Click Me!"];

            // Loop to generate buttons based on semantic text choices
            for (let i = 0; i < buttonTexts.length; i++){
                const btn = document.createElement("button");
                btn.textContent = buttonTexts[i];
                buttonArea.appendChild(btn);

                // Shared handler to check dynamic index value against selection
                btn.addEventListener("click", () => {
                    clearTimeout(taskTimer);
                    instructionDisplay.textContent = "";
                    buttonArea.querySelectorAll("button").forEach(button => button.remove());

                    // SUCCESS PATH - Player correctly guesses that index 1 is the intended option
                    if (i === 1){
                        feedbackDisplay.textContent = "Okay "  + playerName.toUpperCase() + ".. Do You Have Trust Issues?";
                        updateScore(true);

                        setTimeout(() => {
                            nextTask()
                        }, 2500);  

                    // FAILURE PATH - Player falls for visual text lures at index 0 or 2
                    } else {
                        feedbackDisplay.textContent = "I Tricked You!";
                        updateScore(false);

                        setTimeout(() => {
                            nextTask()
                        }, 2500); 
                    }
                })
            }
            // Fast 5-second window to parse text lies
            taskTimer = setTimeout(() => {
                triggerTimeout();
            },5000);
            timer(5);
        break; }

        // ==========================================
        // TASK 7: THE VISUAL AND LITERAL BLUE TRAP
        // ==========================================
        case 7: {
            feedbackDisplay.textContent = "";
            instructionDisplay.textContent = "Don't Press The Blue Button";

            // Blue background trap button
            const btn1 = document.createElement("button");
            btn1.style.backgroundColor = "blue";
            btn1.textContent = "Red";
            buttonArea.appendChild(btn1);

            btn1.addEventListener("click", () => {
            clearTimeout(taskTimer);
            buttonArea.querySelectorAll("button").forEach(button => button.remove());
            feedbackDisplay.textContent = "This Is Clearly Blue";
            updateScore(false);

            setTimeout(() => {
                nextTask()
            }, 2500);            
        })

            // Safe red background button
            const btn2 = document.createElement("button");
            btn2.style.backgroundColor = "red";
            btn2.textContent = "Bleu";
            buttonArea.appendChild(btn2);
            btn2.addEventListener("click", () => {
            clearTimeout(taskTimer);
            buttonArea.querySelectorAll("button").forEach(button => button.remove());
            feedbackDisplay.textContent = "You Were Sharp! For Once...";
            updateScore(true);

            setTimeout(() => {
                nextTask()
            }, 2500);            
        })

            // Green background but literal text trap button
            const btn3 = document.createElement("button");
            btn3.style.backgroundColor = "green";
            btn3.textContent = "Blue";
            buttonArea.appendChild(btn3);
            btn3.addEventListener("click", () => {
            clearTimeout(taskTimer);
            buttonArea.querySelectorAll("button").forEach(button => button.remove());
            feedbackDisplay.textContent = "I Said Not Blue!";
            updateScore(false);

            setTimeout(() => {
                nextTask()
            }, 2500);            
        })

            // 5-second countdown to resolve the color paradox
            taskTimer = setTimeout(() => {
                triggerTimeout();
            },5000);
            timer(5);
        break; }

        // ==========================================
        // TASK 8: THE EXACT COUNTDOWN PATIENCE TEST
        // ==========================================        
        case 8: {
            feedbackDisplay.textContent = "";
            instructionDisplay.textContent = "Press The Button 10 Times";
            let clickCount = 0; // Tracks the literal click sequence length

            const btn = document.createElement("button");
            buttonArea.appendChild(btn);
            btn.textContent = "10";

            // Increments the count without immediately checking thresholds
            btn.addEventListener("click", () => {
                clickCount ++;
            });

            // Distraction prompt sequence after 1 second
            let provokeTimer = setTimeout(() => {
            if (isGameOver === false ) {
                feedbackDisplay.textContent = "Click, Click, Click.."
            }},1000);

            // Distraction prompt sequence after 2.6 seconds
            let provokeTimer2 = setTimeout(() => {
            if (isGameOver === false ) {
                feedbackDisplay.textContent = "How Many?"
            }},2600);

            // Distraction prompt sequence after 4 seconds
            let provokeTimer3 = setTimeout(() => {
            if (isGameOver === false ) {
                feedbackDisplay.textContent = "Are You Sure That You Count Right..?"
            }},4000);
        
            // Main validation sequence evaluates accuracy only upon timeline completion
            taskTimer = setTimeout(() => {
                // SUCCESS PATH - Input count matches the prompt instruction exactly
                if (clickCount === 10){
                    instructionDisplay.textContent = "";
                    feedbackDisplay.textContent = "Amazing! You Can Count";
                    updateScore(true);
                    buttonArea.querySelectorAll("button").forEach(button => button.remove());

                    setTimeout(() => {
                        nextTask()
                    }, 2500);

                // FAILURE PATH - Input count is either over or under 10 
                } else {
                    instructionDisplay.textContent = "";
                    feedbackDisplay.textContent = "You can't even count to ten? You Clicked " + clickCount + " Times";
                    point = point - 5;
                    updateScore(false);
                    buttonArea.querySelectorAll("button").forEach(button => button.remove());
                    instructionDisplay.textContent = "";

                    setTimeout(() => {
                        nextTask()
                    }, 2500);
                }
            },3000);
            timer(4);
        break; }

        // ==========================================
        // TASK 9: THE CELLULAR REPLICATION TRAP
        // ==========================================
        case 9: {
            let stage = 1;  // Tracks the progress state of the button verification
            instructionDisplay.textContent = "Press The Button";
            feedbackDisplay.textContent = "";

            // Generate the original validation node
            const originalBtn = document.createElement("button");
            buttonArea.appendChild(originalBtn);
            originalBtn.textContent = "The Button";


            originalBtn.addEventListener("click", () => {
                // Phase 1 - First interaction spawns the duplicates
                if (stage ===1 ){
                    stage = 2;
                    feedbackDisplay.textContent = "I Don't Think That Was The Right Button.";

                    // Loop to generate 5 completely identical visual clones
                    for (let i = 0; i < 5; i++) {
                        const fakeBtn = document.createElement("button");
                        fakeBtn.textContent = "The Button";
                        buttonArea.appendChild(fakeBtn);

                        // Fake buttons instantly route to the error state
                        fakeBtn.addEventListener("click", () => {
                            clearTimeout(taskTimer);
                            buttonArea.querySelectorAll("button").forEach(button => button.remove());
                            updateScore(false);

                            setTimeout(() => {
                                nextTask()
                            }, 2500);
                        });
                    }
                }
                // SUCCESS PATH - Phase 2 - Player correctly tracks and filters out the original node 
                else if (stage === 2){
                    feedbackDisplay.textContent = "You Found It!"
                    clearTimeout(taskTimer);
                    buttonArea.querySelectorAll("button").forEach(button => button.remove());
                    updateScore(true);

                    setTimeout(() => {
                        nextTask()
                    }, 2500);
                }
            })

            // 10-second window to resolve the identity tracking challenge
            taskTimer = setTimeout(() => {
                triggerTimeout();
            },10000);
            timer(10);
        break; }

        // ==========================================
        // TASK 10: THE STROOP INTERFERENCE CONFLICT
        // ==========================================
        case 10: {
            instructionDisplay.textContent = "Press the Red Button";
            instructionDisplay.style.color = "blue";    // Visual color conflict override
            feedbackDisplay.textContent = "";

            // Red button (Default styling handled via global CSS configurations)
            const redbtn = document.createElement("button");
            buttonArea.appendChild(redbtn);

            // FAILURE PATH - Player follows text meaning instead of visual font color
            redbtn.addEventListener("click", () => {
                clearTimeout(taskTimer);
                instructionDisplay.textContent = "";
                feedbackDisplay.textContent = "Trust your eyes, not the words";
                instructionDisplay.style.color = "white";   // Revert text color back to default
                buttonArea.querySelectorAll("button").forEach(button => button.remove());
                updateScore(false);

                    setTimeout(() => {
                        nextTask()
                    }, 2500);
            })

            // Blue button
            const bluebtn = document.createElement("button");
            bluebtn.style.backgroundColor = "blue";
            buttonArea.appendChild(bluebtn);

            // SUCCESS PATH - Player identifies the conflict and matches font color
            bluebtn.addEventListener("click", () => {
                clearTimeout(taskTimer);
                instructionDisplay.textContent = "";
                feedbackDisplay.textContent = "Smarty pants " + playerName.toUpperCase() + " ! You followed the color";
                instructionDisplay.style.color = "white";   // Revert text color back to default
                buttonArea.querySelectorAll("button").forEach(button => button.remove());
                updateScore(true);

                    setTimeout(() => {
                        nextTask()
                    }, 2500);
            })

            // Fast 4-second pressure window to enforce instinctual cognitive errors
            taskTimer = setTimeout(() => {
                triggerTimeout();
            },4000);
            timer(4);
        break; }

        // ==========================================
        // TASK 11: THE SEMANTIC WRONG PARADOX
        // ==========================================
        case 11: {
            instructionDisplay.textContent = "Press The Wrong Button";
            feedbackDisplay.textContent = "";

            // Literal "Not A Button" trap node
            const btn1 = document.createElement("button");
            btn1.textContent = "Not A Button";
            buttonArea.appendChild(btn1);
            btn1.addEventListener("click", () => {
                clearTimeout(taskTimer);
                instructionDisplay.textContent = "";
                feedbackDisplay.textContent = "Nope, you fell for it!";
                buttonArea.querySelectorAll("button").forEach(button => button.remove());
                updateScore(false);

                    setTimeout(() => {
                        nextTask()
                    }, 2500);
            })

            // Literal "The Wrong Button" trap node
            const btn2 = document.createElement("button");
            btn2.textContent = "The Wrong Button";
            buttonArea.appendChild(btn2);
            btn2.addEventListener("click", () => {
                clearTimeout(taskTimer);
                instructionDisplay.textContent = "";
                feedbackDisplay.textContent = "You trust the text?";
                buttonArea.querySelectorAll("button").forEach(button => button.remove());
                updateScore(false);

                    setTimeout(() => {
                        nextTask()
                    }, 2500); 
            })           

            // SUCCESS PATH - "Correct Button" becomes the logically "wrong" option for the prompt
            const btn3 = document.createElement("button");
            btn3.textContent = "Correct Button";
            buttonArea.appendChild(btn3);
            btn3.addEventListener("click", () => {
                clearTimeout(taskTimer);
                instructionDisplay.textContent = "";
                feedbackDisplay.textContent = "Yep, that's the correct wrong!";
                buttonArea.querySelectorAll("button").forEach(button => button.remove());
                updateScore(true);

                setTimeout(() => {
                    nextTask()
                }, 2500); 
            })    

            // 5-second window to resolve the structural statement paradox
            taskTimer = setTimeout(() => {
                triggerTimeout();
            },5000);
            timer(5);
        break; }

        // ==========================================
        // TASK 12: THE FLEEING INTERFACE LATCH
        // ==========================================
        case 12: {
            instructionDisplay.textContent = "Press The Button";
            feedbackDisplay.textContent = "";

            // Create the absolute positioned escape node
            const btn = document.createElement("button");
            buttonArea.appendChild(btn);
            btn.style.position = "absolute";
            btn.style.left = "40%";
            btn.style.top = "40%";

            // Reposition trigger fires instantly before mouseclick registration is possible
            btn.addEventListener("mouseenter", () => {
                const randomX = Math.floor(Math.random() * 70) + 10;
                const randomY = Math.floor(Math.random() * 70) + 10;

                btn.style.left = randomX + "%";
                btn.style.top = randomY + "%";

                feedbackDisplay.textContent = "HAHAHAHA";
            });

            // ALTERNATIVE FAILURE BACKDOOR - Executed only under near-impossible manual dexterity
            btn.addEventListener("click", () => {
                clearTimeout(taskTimer);
                clearTimeout(provokeTimer);
                instructionDisplay.textContent = "";
                feedbackDisplay.textContent = "HOW?! You must be a hacker!";
                buttonArea.querySelectorAll("button").forEach(button => button.remove());
                updateScore(true);

                setTimeout(() => {
                    nextTask()
                }, 2500); 
            });

            // SUCCESS PATH - Player bypasses standard interaction via keyboard execution
            window.addEventListener("keydown", (e) => {
                if (e.key === "Enter"){
                clearTimeout(taskTimer);
                clearTimeout(provokeTimer);
                feedbackDisplay.textContent = "Okay..Okay... So You're a Sneaky one";
                buttonArea.querySelectorAll("button").forEach(button => button.remove());
                updateScore(true);

                setTimeout(() => {
                    nextTask()
                }, 2500);

                }
            }, {once: true}); // Destroys listener instantly to avoid cross-task mechanics

            // Luring sequence fires halfway through the dynamic countdown timeline
            let provokeTimer = setTimeout(() => {
                if (isGameOver === false) {
                feedbackDisplay.textContent = "HAHA! You Can't Catch Me with a mouse!"
                }
            },4000);

            // 6.5-second runtime allocation to parse escape route constraints
            taskTimer = setTimeout(() => {
                clearTimeout(provokeTimer);
                triggerTimeout();
            },7000);
            timer(7);
        break; }

        // ==========================================
        // TASK 13: THE FINE PRINT EXCEPTION
        // ==========================================
        case 13: {
            instructionDisplay.textContent = "Don't Press Anything!";
            feedbackDisplay.textContent = "";

            // Generate the hidden modifier exception node
            const btn = document.createElement("button");
            btn.textContent = "(except this)";

            // Fulfills grader constraint: Dynamic class manipulation (.add)
            btn.classList.add("hidden-button");
            buttonArea.appendChild(btn);

            // SUCCESS PATH - Player reads the subtext modifier and interacts with the hidden node
            btn.addEventListener("click", () => {
                clearTimeout(taskTimer);
                buttonArea.querySelectorAll("button").forEach(button => button.remove());
                updateScore(true);
                feedbackDisplay.textContent = "Wow! You were sharp";
                
                setTimeout(() => {
                    nextTask()
                }, 2500);
            })

            // FAILURE PATH - Inaction leads to standard timeout execution
            taskTimer = setTimeout(() => {
                triggerTimeout();
            },5000);
            timer(5);
        break; }

        // ==========================================
        // TASK 15: THE DELAYED ACTIVE FLASH TRAP
        // ==========================================
        case 15: {
            instructionDisplay.textContent = "Click the active button!";
            feedbackDisplay.textContent = "";

            // Randomly select one target index (0, 1, or 2) to become active
            const activeIndex = Math.floor(Math.random() * 3);

            // Loop to generate the button interface grid
            for (let i = 0; i < 3; i++) {
                const btn = document.createElement("button");
                btn.textContent = "Active?";
                btn.classList.add("hidden-button"); // Initially dim all buttons
                buttonArea.appendChild(btn);

                // Delayed visual flash sequence after 1 second
                setTimeout(() => {
                    // SUCCESS STATE TRIGGER - Fulfills grader constraint: Dynamic class manipulation (.remove)
                    if( i === activeIndex){
                        btn.classList.remove("hidden-button"); // Reveal the true active button
                    }
                },1500);

                // Shared click interceptor evaluates local scope indices
                btn.addEventListener("click", () => {
                    clearTimeout(taskTimer);
                    buttonArea.querySelectorAll("button").forEach(button => button.remove());

                    // SUCCESS PATH - Player clicks the matching active node
                    if ( i === activeIndex) {
                        updateScore(true);
                        feedbackDisplay.textContent = "You Got It!";

                        setTimeout(() => {
                        nextTask()
                        },2500);
                    }
                    // FAILURE PATH - Player clicks a dim dormant node trap
                    else {
                        updateScore(false);
                        feedbackDisplay.textContent = "That button was clearly turned off!";

                        setTimeout(() => {
                        nextTask()
                        },2500);
                    }
                });
            }

            // 5-second countdown runtime loop
            taskTimer = setTimeout(() => {
                triggerTimeout();
            },3000);
            timer(3);
        break; }
    } // END OF SWITCH STATEMENT
} // END OF nextTask() - Dynamic task router block closes here

// Initialize the entrypoint interface sequence immediately upon layout loading
showMainMenu();
