class CreateEmployees < ActiveRecord::Migration[8.0]
  def change
    create_table :employees do |t|
      t.string :full_name, null: false
      t.string :email, null: false
      t.string :job_title, null: false
      t.string :department, null: false
      t.string :country, null: false, limit: 2
      t.integer :salary, null: false # annual, whole units of local currency
      t.date :hired_on, null: false
      t.timestamps
    end

    add_check_constraint :employees, "salary > 0", name: "employees_salary_positive"
    add_index :employees, :email, unique: true
    add_index :employees, :country
    add_index :employees, :department
    add_index :employees, :job_title
    add_index :employees, :salary
  end
end
