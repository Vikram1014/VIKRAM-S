using UnityEngine;
using TurboKids.Core;

namespace TurboKids.Car
{
    [RequireComponent(typeof(Rigidbody))]
    public class CarController : MonoBehaviour
    {
        [Header("Car Settings")]
        public float forwardSpeed = 15f;
        public float turnSpeed = 100f;
        public float boostMultiplier = 1.5f;
        public float boostDuration = 2f;

        private Rigidbody rb;
        private float currentSteeringInput = 0f;
        private bool isBoosting = false;
        private float boostTimer = 0f;

        // Mobile touch control variables
        private bool isPressingLeft = false;
        private bool isPressingRight = false;

        private void Awake()
        {
            rb = GetComponent<Rigidbody>();
            // Keep the car from tipping over too easily
            rb.centerOfMass = new Vector3(0, -0.5f, 0);
        }

        private void Update()
        {
            // Only control the car if we are actually racing
            if (GameManager.Instance != null && GameManager.Instance.CurrentState != GameState.Racing)
            {
                return;
            }

            HandleInput();
            HandleBoostTimer();
        }

        private void FixedUpdate()
        {
            if (GameManager.Instance != null && GameManager.Instance.CurrentState != GameState.Racing)
            {
                rb.velocity = Vector3.zero;
                return;
            }

            MoveForward();
            Steer();
        }

        private void HandleInput()
        {
            // Keyboard input for testing in editor
            float keyboardInput = Input.GetAxisRaw("Horizontal");

            // Combine touch and keyboard input
            if (isPressingLeft) currentSteeringInput = -1f;
            else if (isPressingRight) currentSteeringInput = 1f;
            else currentSteeringInput = keyboardInput;
        }

        private void MoveForward()
        {
            float currentSpeed = isBoosting ? forwardSpeed * boostMultiplier : forwardSpeed;

            // Move the car forward continuously
            Vector3 forwardMove = transform.forward * currentSpeed * Time.fixedDeltaTime;
            rb.MovePosition(rb.position + forwardMove);
        }

        private void Steer()
        {
            if (currentSteeringInput != 0)
            {
                float turn = currentSteeringInput * turnSpeed * Time.fixedDeltaTime;
                Quaternion turnRotation = Quaternion.Euler(0f, turn, 0f);
                rb.MoveRotation(rb.rotation * turnRotation);
            }
        }

        public void ActivateBoost()
        {
            isBoosting = true;
            boostTimer = boostDuration;
            // Play boost sound or particle effect here
        }

        private void HandleBoostTimer()
        {
            if (isBoosting)
            {
                boostTimer -= Time.deltaTime;
                if (boostTimer <= 0)
                {
                    isBoosting = false;
                }
            }
        }

        // Methods to be hooked up to UI Event Triggers (PointerDown/PointerUp)
        public void OnLeftButtonDown() => isPressingLeft = true;
        public void OnLeftButtonUp() => isPressingLeft = false;
        public void OnRightButtonDown() => isPressingRight = true;
        public void OnRightButtonUp() => isPressingRight = false;

        private void OnCollisionEnter(Collision collision)
        {
            if (collision.gameObject.CompareTag("Obstacle"))
            {
                // Simple cartoon bump: reduce velocity briefly
                rb.velocity = rb.velocity * 0.5f;
                // Play BONK sound
            }
        }
    }
}
