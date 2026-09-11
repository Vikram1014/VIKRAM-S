using UnityEngine;
using TurboKids.Core;
using System.Collections.Generic;

namespace TurboKids.AI
{
    [RequireComponent(typeof(Rigidbody))]
    public class AIController : MonoBehaviour
    {
        [Header("AI Settings")]
        public float forwardSpeed = 12f;
        public float turnSpeed = 5f;
        public float waypointTolerance = 3f;

        [Header("Waypoints")]
        public Transform waypointsContainer;
        private List<Transform> waypoints = new List<Transform>();
        private int currentWaypointIndex = 0;

        private Rigidbody rb;

        private void Awake()
        {
            rb = GetComponent<Rigidbody>();
            rb.centerOfMass = new Vector3(0, -0.5f, 0);

            if (waypointsContainer != null)
            {
                foreach (Transform child in waypointsContainer)
                {
                    waypoints.Add(child);
                }
            }
            else
            {
                Debug.LogWarning($"AIController on {gameObject.name} has no waypoints assigned!");
            }
        }

        private void FixedUpdate()
        {
            if (GameManager.Instance != null && GameManager.Instance.CurrentState != GameState.Racing)
            {
                rb.velocity = Vector3.zero;
                return;
            }

            if (waypoints.Count == 0) return;

            DriveTowardsWaypoint();
        }

        private void DriveTowardsWaypoint()
        {
            Transform targetWaypoint = waypoints[currentWaypointIndex];

            // Check if we are close enough to the current waypoint to switch to the next
            float distanceToWaypoint = Vector3.Distance(transform.position, targetWaypoint.position);
            if (distanceToWaypoint < waypointTolerance)
            {
                currentWaypointIndex = (currentWaypointIndex + 1) % waypoints.Count;
                targetWaypoint = waypoints[currentWaypointIndex];
            }

            // Steer towards waypoint
            Vector3 directionToTarget = (targetWaypoint.position - transform.position).normalized;
            // Ignore Y axis for steering to prevent the car from tilting up/down unnaturally
            directionToTarget.y = 0;

            if (directionToTarget != Vector3.zero)
            {
                Quaternion targetRotation = Quaternion.LookRotation(directionToTarget);
                rb.MoveRotation(Quaternion.Slerp(rb.rotation, targetRotation, turnSpeed * Time.fixedDeltaTime));
            }

            // Move forward
            Vector3 forwardMove = transform.forward * forwardSpeed * Time.fixedDeltaTime;
            rb.MovePosition(rb.position + forwardMove);
        }

        private void OnCollisionEnter(Collision collision)
        {
            if (collision.gameObject.CompareTag("Obstacle"))
            {
                rb.velocity = rb.velocity * 0.5f;
            }
        }
    }
}
