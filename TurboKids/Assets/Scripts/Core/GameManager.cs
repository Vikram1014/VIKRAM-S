using UnityEngine;

namespace TurboKids.Core
{
    public enum GameState
    {
        MainMenu,
        TrackSelect,
        Garage,
        Loading,
        RaceCountdown,
        Racing,
        RaceFinished,
        Paused
    }

    public class GameManager : MonoBehaviour
    {
        public static GameManager Instance { get; private set; }

        public GameState CurrentState { get; private set; }

        private void Awake()
        {
            if (Instance == null)
            {
                Instance = this;
                DontDestroyOnLoad(gameObject);
            }
            else
            {
                Destroy(gameObject);
            }
        }

        private void Start()
        {
            ChangeState(GameState.MainMenu);
        }

        public void ChangeState(GameState newState)
        {
            CurrentState = newState;
            Debug.Log($"Game State changed to: {newState}");

            // Here you would fire an event or notify other systems of the state change
            // OnGameStateChanged?.Invoke(newState);
        }
    }
}
