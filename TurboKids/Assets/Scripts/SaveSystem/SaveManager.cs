using UnityEngine;
using System;

namespace TurboKids.SaveSystem
{
    [Serializable]
    public class PlayerData
    {
        public int version = 1;
        public int coins = 0;
        public int stars = 0;
        public string selectedCar = "StarterCar";
        // In a full implementation, you'd have lists for unlocked tracks and cars here.
    }

    public class SaveManager : MonoBehaviour
    {
        public static SaveManager Instance { get; private set; }

        public PlayerData Data { get; private set; }

        private const string SAVE_KEY = "TurboKids_SaveData";

        private void Awake()
        {
            if (Instance == null)
            {
                Instance = this;
                DontDestroyOnLoad(gameObject);
                LoadData();
            }
            else
            {
                Destroy(gameObject);
            }
        }

        public void SaveData()
        {
            string json = JsonUtility.ToJson(Data);
            PlayerPrefs.SetString(SAVE_KEY, json);
            PlayerPrefs.Save();
            Debug.Log("Game Saved.");
        }

        public void LoadData()
        {
            if (PlayerPrefs.HasKey(SAVE_KEY))
            {
                string json = PlayerPrefs.GetString(SAVE_KEY);
                Data = JsonUtility.FromJson<PlayerData>(json);
                Debug.Log("Save Data Loaded.");
            }
            else
            {
                // New game
                Data = new PlayerData();
                SaveData();
                Debug.Log("Created New Save Data.");
            }
        }

        public void AddCoins(int amount)
        {
            Data.coins += amount;
            SaveData();
        }

        public void AddStars(int amount)
        {
            Data.stars += amount;
            SaveData();
        }
    }
}
