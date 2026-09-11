using UnityEngine;

namespace TurboKids.Race
{
    [RequireComponent(typeof(Collider))]
    public class Checkpoint : MonoBehaviour
    {
        private void OnTriggerEnter(Collider other)
        {
            if (other.CompareTag("Player"))
            {
                if (RaceManager.Instance != null)
                {
                    RaceManager.Instance.RegisterCheckpointPassed();
                    // Disable collider temporarily so it isn't double-triggered
                    GetComponent<Collider>().enabled = false;
                    Invoke(nameof(Reactivate), 5f);
                }
            }
        }

        private void Reactivate()
        {
            GetComponent<Collider>().enabled = true;
        }
    }
}
