using UnityEngine;

namespace TurboKids.Race
{
    [RequireComponent(typeof(Collider))]
    public class FinishLine : MonoBehaviour
    {
        private void OnTriggerEnter(Collider other)
        {
            if (other.CompareTag("Player"))
            {
                if (RaceManager.Instance != null)
                {
                    RaceManager.Instance.OnFinishLineCrossed(true);
                }
            }
            else if (other.CompareTag("AI"))
            {
                if (RaceManager.Instance != null)
                {
                    RaceManager.Instance.OnFinishLineCrossed(false);
                }
            }
        }
    }
}
