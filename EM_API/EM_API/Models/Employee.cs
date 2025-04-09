using System.ComponentModel.DataAnnotations;

namespace EM_API.Models
{
    public class Employee
    {
        [Key]
        public int EmployeeId { get; set; }

        [MaxLength(100)]
        public string Name { get; set; }

        public int Age { get; set; }

        [MaxLength(50)]
        public string Department { get; set; }

        [MaxLength(100)]
        [EmailAddress]
        public string Email { get; set; }
        public DateTime JoiningDate { get; set; }
    }
}
