using UnityEngine;
using System.Collections;
using TurboKids.Core;
using TurboKids.SaveSystem;

namespace TurboKids.Race
{
    public class RaceManager : MonoBehaviour
    {
        public static RaceManager Instance { get; private set; }

        [Header("Race Settings")]
        public int totalLaps = 3;
        public int currentLap = 1;
        public int totalCheckpoints;

        [Header("Rewards")]
        public int coinsRewardFirstPlace = 100;

        private int playerCheckpointsPassed = 0;
        private float raceTimer = 0f;

        private void Awake()
        {
            if (Instance == null) Instance = this;
            else Destroy(gameObject);
        }

        private void Start()
        {
            StartCoroutine(RaceCountdownRoutine());
        }

        private void Update()
        {
            if (GameManager.Instance.CurrentState == GameState.Racing)
            {
                raceTimer += Time.deltaTime;
            }
        }

        private IEnumerator RaceCountdownRoutine()
        {
            GameManager.Instance.ChangeState(GameState.RaceCountdown);

            // Wait for scene to fully load/stabilize
            yield return new WaitForSeconds(1f);

            // In a real game, you would update UI text here (3... 2... 1...)
            Debug.Log("3...");
            yield return new WaitForSeconds(1f);
            Debug.Log("2...");
            yield return new WaitForSeconds(1f);
            Debug.Log("1...");
            yield return new WaitForSeconds(1f);

            Debug.Log("GO!");
            GameManager.Instance.ChangeState(GameState.Racing);
        }

        public void RegisterCheckpointPassed()
        {
            playerCheckpointsPassed++;
        }

        public void OnFinishLineCrossed(bool isPlayer)
        {
            if (!isPlayer) return; // Ignore AI for now

            // Ensure player didn't just turn around and cross backward
            if (playerCheckpointsPassed >= totalCheckpoints)
            {
                if (currentLap < totalLaps)
                {
                    currentLap++;
                    playerCheckpointsPassed = 0; // Reset for next lap
                    Debug.Log($"Lap {currentLap} started!");
                }
                else
                {
                    FinishRace();
                }
            }
        }

        private void FinishRace()
        {
            GameManager.Instance.ChangeState(GameState.RaceFinished);
            Debug.Log($"Race Finished! Time: {raceTimer:F2} seconds");

            // Give rewards (Assuming 1st place for the prototype)
            if (SaveManager.Instance != null)
            {
                SaveManager.Instance.AddCoins(coinsRewardFirstPlace);
                SaveManager.Instance.AddStars(3);
                Debug.Log($"Rewarded {coinsRewardFirstPlace} coins and 3 stars!");
            }

            // Show Results UI
        }
    }
}
